from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta
from flask_migrate import Migrate
from dotenv import load_dotenv
from flask_cors import CORS
import os

load_dotenv()

app = Flask(__name__)
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app, supports_credentials=True)

db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# Models
class User(db.Model):
    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(255))
    role = db.Column(db.String(20), default='customer')
    restaurants = db.relationship('Restaurant', backref='owner', lazy=True)
    orders = db.relationship('Order', backref='user', lazy=True)

class Restaurant(db.Model):
    restaurant_id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.user_id'))
    name = db.Column(db.String(100))
    address = db.Column(db.String(255))
    menus = db.relationship('Menu', backref='restaurant', lazy=True)
    orders = db.relationship('Order', backref='restaurant', lazy=True)

class Menu(db.Model):
    menu_id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurant.restaurant_id'))
    name = db.Column(db.String(100))
    description = db.Column(db.Text)
    price = db.Column(db.Float)
    available = db.Column(db.Boolean, default=True)

class Order(db.Model):
    order_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'))
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurant.restaurant_id'))
    status = db.Column(db.String(20), default='received')  # received, preparing, ready, delivered, cancelled
    total_price = db.Column(db.Float)
    order_date = db.Column(db.DateTime, server_default=db.func.now())

class OrderItem(db.Model):
    order_item_id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.order_id'))
    menu_id = db.Column(db.Integer, db.ForeignKey('menu.menu_id'))
    quantity = db.Column(db.Integer)
    price = db.Column(db.Float)

@app.route('/')
def home():
    return "Welcome to FlavorFi API!"

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'customer')  # default to customer if not provided

    if not all([name, email, password]):
        return jsonify({'msg': 'Missing required fields'}), 400

    if role not in ['customer', 'owner']:
        return jsonify({'msg': 'Invalid role'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'msg': 'Email already registered'}), 409

    hashed_password = generate_password_hash(password)

    new_user = User(name=name, email=email, password=hashed_password, role=role)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'msg': 'User created successfully'}), 201



@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({'msg': 'Missing email or password'}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({'msg': 'Bad email or password'}), 401

    # ✅ FIX HERE
    access_token = create_access_token(identity=str(user.user_id))

    return jsonify({
        'user': {
            'user_id': user.user_id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        },
        'token': access_token
    }), 200


@app.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    identity = get_jwt_identity()

    try:
        user_id = int(identity)
    except ValueError:
        return jsonify({'msg': 'Invalid token identity'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'msg': 'User not found'}), 404

    return jsonify({
        'name': user.name,
        'email': user.email,
        'role': user.role
    }), 200


@app.route('/restaurants', methods=['POST'])
@jwt_required()
def create_restaurant():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    # Only allow restaurant owners to create restaurants (optional)
    if user.role != 'owner':
        return jsonify({'msg': 'Only owners can create restaurants'}), 403

    data = request.get_json()
    name = data.get('name')
    address = data.get('address')

    if not name or not address:
        return jsonify({'msg': 'Name and address are required'}), 400

    new_restaurant = Restaurant(name=name, address=address, owner_id=current_user_id)
    db.session.add(new_restaurant)
    db.session.commit()

    return jsonify({'msg': 'Restaurant created', 'restaurant_id': new_restaurant.restaurant_id}), 201

@app.route('/restaurants/<int:restaurant_id>/menus', methods=['POST'])
@jwt_required()
def create_menu_item(restaurant_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    # Check if restaurant exists and belongs to this user
    restaurant = Restaurant.query.get(restaurant_id)
    if not restaurant:
        return jsonify({'msg': 'Restaurant not found'}), 404
    if restaurant.owner_id != current_user_id:
        return jsonify({'msg': 'Not authorized to add menu to this restaurant'}), 403

    data = request.get_json()
    name = data.get('name')
    description = data.get('description', '')
    price = data.get('price')
    
    available = data.get('available', True)

    if price is None or not isinstance(price, (int, float)) or price < 0:
        return jsonify({'msg': 'Price must be a positive number'}), 400

    new_menu_item = Menu(
        restaurant_id=restaurant_id,
        name=name,
        description=description,
        price=price,
        available=available
    )
    
    db.session.add(new_menu_item)
    db.session.commit()

    return jsonify({'msg': 'Menu item created', 'menu_id': new_menu_item.menu_id}), 201
    
@app.route('/menus/<int:menu_id>', methods=['PUT'])
@jwt_required()
def update_menu_item(menu_id):
    current_user_id = get_jwt_identity()
    menu_item = Menu.query.get(menu_id)

    if not menu_item:
        return jsonify({'msg': 'Menu item not found'}), 404

    # Check if the current user owns the restaurant this menu belongs to
    if menu_item.restaurant.owner_id != current_user_id:
        return jsonify({'msg': 'Not authorized to update this menu item'}), 403

    data = request.get_json()

    available = data.get('available', menu_item.available)
    if not isinstance(available, bool):
        return jsonify({'msg': 'Available must be a boolean'}), 400

    menu_item.name = data.get('name', menu_item.name)
    menu_item.description = data.get('description', menu_item.description)
    menu_item.price = data.get('price', menu_item.price)
    menu_item.available = available

    db.session.commit()

    return jsonify({'msg': 'Menu item updated'})

@app.route('/menus/<int:menu_id>', methods=['DELETE'])
@jwt_required()
def delete_menu_item(menu_id):
    current_user_id = get_jwt_identity()
    menu_item = Menu.query.get(menu_id)

    if not menu_item:
        return jsonify({'msg': 'Menu item not found'}), 404

    if menu_item.restaurant.owner_id != current_user_id:
        return jsonify({'msg': 'Not authorized to delete this menu item'}), 403

    db.session.delete(menu_item)
    db.session.commit()

    return jsonify({'msg': 'Menu item deleted'})

@app.route('/restaurants/<int:restaurant_id>/menus', methods=['GET'])
def list_menu_items(restaurant_id):
    restaurant = Restaurant.query.get(restaurant_id)
    if not restaurant:
        return jsonify({'msg': 'Restaurant not found'}), 404

    menus = Menu.query.filter_by(restaurant_id=restaurant_id).all()
    results = [{
        'menu_id': menu.menu_id,
        'name': menu.name,
        'description': menu.description,
        'price': menu.price,
        'available': menu.available
    } for menu in menus]

    return jsonify({
        'restaurant_id': restaurant.restaurant_id,
        'name': restaurant.name,
        'address': restaurant.address,
        'menus': results
    }), 200

@app.route('/restaurants', methods=['GET'])
def list_restaurants():
    restaurants = Restaurant.query.all()
    results = [{
        'restaurant_id': r.restaurant_id,
        'name': r.name,
        'address': r.address
    } for r in restaurants]
    return jsonify(results), 200

@app.route('/orders', methods=['POST'])
@jwt_required()
def create_order():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    restaurant_id = data.get('restaurant_id')
    items = data.get('items')

    if not restaurant_id or not items:
        return jsonify({'msg': 'restaurant_id and items are required'}), 400
    if not isinstance(items, list) or len(items) == 0:
        return jsonify({'msg': 'items must be a non-empty list'}), 400

    restaurant = Restaurant.query.get(restaurant_id)
    if not restaurant:
        return jsonify({'msg': 'Restaurant not found'}), 404

    total_price = 0.0
    order_items = []

    menu_ids = [item['menu_id'] for item in items]
    menus = Menu.query.filter(Menu.menu_id.in_(menu_ids), Menu.restaurant_id == restaurant_id).all()
    menu_dict = {menu.menu_id: menu for menu in menus}

    for item in items:
        menu_id = item.get('menu_id')
        quantity = item.get('quantity')

        if menu_id is None or quantity is None:
            return jsonify({'msg': 'Each item must have menu_id and quantity'}), 400

        if not menu_id or not quantity:
            return jsonify({'msg': 'Each item must have menu_id and quantity'}), 400
        if not isinstance(quantity, int) or quantity <= 0:
            return jsonify({'msg': 'Quantity must be a positive integer'}), 400

        menu_item = menu_dict.get(menu_id)
        
        if not menu_item:
            return jsonify({'msg': f'Menu item {menu_id} not found in this restaurant'}), 404
        if not menu_item.available:
            return jsonify({'msg': f'Menu item {menu_item.name} is not available'}), 400

        item_price = menu_item.price * quantity
        total_price += item_price

        order_items.append({
            'menu_id': menu_id,
            'quantity': quantity,
            'price': menu_item.price
        })

    # Create Order
    new_order = Order(
        user_id=current_user_id,
        restaurant_id=restaurant_id,
        total_price=total_price,
        status='received'
    )
    db.session.add(new_order)
    db.session.flush()  # flush to get new_order.order_id

    # Create OrderItems
    
    for oi in order_items:
        order_item = OrderItem(
            order_id=new_order.order_id,
            menu_id=oi['menu_id'],
            quantity=oi['quantity'],
            price=oi['price']
        )
        db.session.add(order_item)
    db.session.commit()
    
    return jsonify({
        'msg': 'Order created',
        'order_id': new_order.order_id,
        'total_price': total_price,
        'status': new_order.status
    }), 201

@app.route('/orders', methods=['GET'])
@jwt_required()
def list_user_orders():
    current_user_id = get_jwt_identity()
    orders = Order.query.filter_by(user_id=current_user_id).all()

    results = [{
        'order_id': o.order_id,
        'restaurant_id': o.restaurant_id,
        'status': o.status,
        'total_price': o.total_price,
        'order_date': o.order_date.isoformat()
    } for o in orders]

    return jsonify(results), 200

@app.route('/orders/<int:order_id>', methods=['GET'])
@jwt_required()
def order_details(order_id):
    current_user_id = get_jwt_identity()
    order = Order.query.get(order_id)

    if not order:
        return jsonify({'msg': 'Order not found'}), 404

    # Only the user who placed the order or the restaurant owner can view the order
    if order.user_id != current_user_id and order.restaurant.owner_id != current_user_id:
        return jsonify({'msg': 'Not authorized to view this order'}), 403

    items = OrderItem.query.filter_by(order_id=order_id).all()
    items_data = []
    for item in items:
        menu = Menu.query.get(item.menu_id)
        items_data.append({
            'menu_id': item.menu_id,
            'menu_name': menu.name if menu else None,
            'quantity': item.quantity,
            'price_per_item': item.price
        })

    return jsonify({
        'order_id': order.order_id,
        'restaurant_id': order.restaurant_id,
        'status': order.status,
        'total_price': order.total_price,
        'order_date': order.order_date.isoformat(),
        'items': items_data
    }), 200

@app.route('/orders/<int:order_id>/status', methods=['PUT'])
@jwt_required()
def update_order_status(order_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.role != 'owner':
        return jsonify({'msg': 'Only owners can update order status'}), 403

    order = Order.query.get(order_id)
    if not order:
        return jsonify({'msg': 'Order not found'}), 404

    # Check if order belongs to one of this owner's restaurants
    if order.restaurant.owner_id != current_user_id:
        return jsonify({'msg': 'Not authorized to update this order'}), 403

    data = request.get_json()
    new_status = data.get('status')
    allowed_statuses = ['received', 'preparing', 'ready', 'delivered', 'cancelled']

    if new_status not in allowed_statuses:
        return jsonify({'msg': f'Status must be one of {allowed_statuses}'}), 400

    order.status = new_status
    db.session.commit()

    return jsonify({'msg': 'Order status updated', 'status': order.status})

@app.errorhandler(404)
def not_found(e):
    return jsonify({'msg': 'Resource not found'}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({'msg': 'Internal server error'}), 500

