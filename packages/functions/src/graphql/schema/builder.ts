import SchemaBuilder from "@pothos/core";

export const builder = new SchemaBuilder<{
  Objects: {};
  Interfaces: {};
  Scalars: {
    Date: { Input: Date; Output: Date };
  };
  DefaultFieldNullability: false;
  DefaultInputFieldRequiredness: true;
}>({
  defaultFieldNullability: false,
  defaultInputFieldRequiredness: true,
});
