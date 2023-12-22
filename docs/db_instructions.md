# DB Instructions

## Usage

```TypeScript
import { Collection, Collections, connectToDatabase } from "@/lib/db/mongo";
import { SomeSchema } from "@/lib/db/schema/request";
import * as zod from "zod";

const collections: Collections = await connectToDatabase();
const someCollection: Collection<zod.infer<typeof SomeSchema>> = collections.someCollection;
```

## Adding Collections

### Step 1: Create a document schema

1. Open `@/db/schema/schema-file.ts`, where `schema-file` is an appropriately named file for your schema.
2. Create a schema with `zod`

> ```TypeScript
> import * as zod from "zod";
>
> const someSchema = zod.object({
>   attr1: z.type().<...>,
>   ...,
>   attrN: z.type().<...>,
> })
> ```

3. Add the schema to the export statement in the same file.

> ```TypeScript
> export { SomeSchema };
> ```

### Step 2: Add the collection to `Collections`

1. Open `@/db/mongo`.
2. Add the newly created `Collection<Schema>` to the `Collections` interface.

> ```TypeScript
> import * as zod from "zod";
> import { someSchema } from "@/db/schema/schema-file.ts";
>
> interface Collections {
>   someCollection: Collection<zod.infer<typeof SomeSchema>>;
> }
> ```

3. Create the connection in the exported `connectToDatabase()` function.

> ```TypeScript
> const collections: Collections = {
>   // where `someCollection` is the name of the collection in the db.
>   someCollection: db.collection("someCollection"),
> };
> ```

### Step 3: Use the created collection

```TypeScript
import { Collection, Collections, connectToDatabase } from "@/lib/db/mongo";
import { SomeSchema } from "@/lib/db/schema/request";
import * as zod from "zod";

const collections: Collections = await connectToDatabase();
const someCollection: Collection<zod.infer<typeof SomeSchema>> = collections.someCollection;
```
