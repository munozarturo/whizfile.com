# DB Instructions

## Usage

```TypeScript
import {
    Collection,
    Collections,
    SomeSchema,
    connectToDatabase,
} from "@/db/mongo";

const collections: Collections = await connectToDatabase();
const someCollection: Collection<SomeSchema> = collections.someCollection;
```

## Adding Collections

**_ Step 1: Create a document schema _**

1. Open `@/db/schema`.
2. Create a schema.

> ```TypeScript
> class SomeSchema {
>   constructor(
>       public attr1: type<attr1>,
>       public attr2: type<attr2>,
>       ...
>       public attrN: type<attrN>,
>       public id?: ObjectId
>   ) {}
> }
> ```

3. Add the schema to the export statement.

> ```TypeScript
> export { SomeSchema };
> ```

**_ Step 2: Add the collection to `Collections` _**

1. Open `@/db/mongo`.
2. Add the newly created `Collection<Schema>` to the `Collections` interface.

> ```TypeScript
> interface Collections {
>   requests: Collection<schema.SomeSchema>;
> }
> ```

3. Create the connection in the exported `connectToDatabase()` function.

> ```TypeScript
> const collections: Collections = {
>   // where `collectionName` is the name of the collection in the db.
>   requests: db.collection("collectionName"),
> };
> ```

**_ Step 3: Use the created collection _**

```TypeScript
import {
    Collection,
    Collections,
    SomeSchema,
    connectToDatabase,
} from "@/db/mongo";

const collections: Collections = await connectToDatabase();
const someCollection: Collection<SomeSchema> = collections.someCollection;
```
