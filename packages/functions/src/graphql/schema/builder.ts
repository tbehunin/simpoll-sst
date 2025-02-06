import SchemaBuilder from '@pothos/core';
import DataloaderPlugin from '@pothos/plugin-dataloader';
import { ContextType } from '../context';

export const builder = new SchemaBuilder<{
  Context: ContextType,
  Objects: {},
  Interfaces: {},
  Scalars: {
    Date: { Input: Date; Output: Date };
  },
  DefaultFieldNullability: false,
  DefaultInputFieldRequiredness: true,
}>({
  plugins: [DataloaderPlugin],
  defaultFieldNullability: false,
  defaultInputFieldRequiredness: true,
});
