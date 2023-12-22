# MongoDB Setup

- [MongoDB Setup](#mongodb-setup)
  - [Creating A Database](#creating-a-database)
  - [Creating Roles](#creating-roles)
    - [prod\_readWriteAny](#prod_readwriteany)
    - [test\_readWriteAny](#test_readwriteany)
  - [Creating a User](#creating-a-user)
    - [prod\_dbUser](#prod_dbuser)
    - [test\_dbUser](#test_dbuser)
  - [Connecting](#connecting)

## Creating A Database

Create a database deployment.

## Creating Roles

Inside of roles create a role for database access.

### prod_readWriteAny

Only on `prod` database. All collection.

```text
prod_readWriteAny
find @prod(all collections)
insert @prod(all collections)
remove @prod(all collections)
update @prod(all collections)
bypassDocumentValidation @prod(all collections)
```

### test_readWriteAny

Only on `test` database. All collection.

```text
test_readWriteAny
find @test(all collections)
insert @test(all collections)
remove @test(all collections)
update @test(all collections)
bypassDocumentValidation @test(all collections)
```

## Creating a User

### prod_dbUser

Create a user with the name `prod_dbUser` and give them the custom role `prod_readWriteAny`. Generate a password for this user.

### test_dbUser

Create a user with the name `test_dbUser` and give them the custom role `test_readWriteAny`. Generate a password for this user.

## Connecting

Get a connection URI and enter the correct access credentials in place of `<username>:<password>`.

```text
mongodb+srv://<username>:<password>@whizfile-us-east.alseazi.mongodb.net/?retryWrites=true&w=majority
```
