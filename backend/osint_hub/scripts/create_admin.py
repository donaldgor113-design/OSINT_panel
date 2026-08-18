import asyncio
import getpass

from sqlalchemy import select

from osint_hub.infrastructure.database.connection import async_session_factory
from osint_hub.infrastructure.database.models import User
from osint_hub.security.password import hash_password, validate_password_strength


async def create_admin() -> None:
    username = input("Username: ").strip()
    email = input("Email (optional): ").strip() or None

    while True:
        password = getpass.getpass("Password: ")
        errors = validate_password_strength(password)
        if errors:
            print("\n".join(errors))
            continue
        if password != getpass.getpass("Confirm password: "):
            print("Паролі не збігаються, спробуйте ще раз.")
            continue
        break

    async with async_session_factory() as db:
        existing = await db.execute(select(User).where(User.username == username))
        if existing.scalar_one_or_none() is not None:
            print(f"Користувач '{username}' вже існує.")
            return

        password_hash, password_salt = hash_password(password)
        admin = User(
            username=username,
            email=email,
            password_hash=password_hash,
            password_salt=password_salt,
            is_admin=True,
            is_active=True,
        )
        db.add(admin)
        await db.commit()
        print(f"Адміністратора '{username}' створено.")


if __name__ == "__main__":
    asyncio.run(create_admin())
