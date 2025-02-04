import { builder } from './builder';
import './common';
import './types';
import './unions';
import './queries';
import './mutations';

builder.queryType({});
builder.mutationType({});
export const schema = builder.toSchema();
