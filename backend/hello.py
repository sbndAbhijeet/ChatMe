from passlib.context import CryptContext
pwd = CryptContext(schemes=["bcrypt"])

def main():
    print(pwd.hash("1234"))


if __name__ == "__main__":
    main()
