import SchemaBuilder from '@pothos/core';
import DataloaderPlugin from '@pothos/plugin-dataloader';
import RelayPlugin from '@pothos/plugin-relay';
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
  plugins: [DataloaderPlugin, RelayPlugin],
  relay: {
    clientMutationId: 'omit',
    cursorType: 'String',
    nodesOnConnection: true,
  },
  defaultFieldNullability: false,
  defaultInputFieldRequiredness: true,
});
