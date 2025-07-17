from app import app, db
from app import Menu  # import your model(s)

with app.app_context():
    menu = Menu(name="Lunch Menu")
    db.session.add(menu)
    db.session.commit()
    print("Seed data added.")
