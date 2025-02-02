import { builder } from './builder';
import './common';
import './interfaces';
import './types';
import './queries';
import './mutations';

builder.queryType({});
builder.mutationType({});
export const schema = builder.toSchema();
