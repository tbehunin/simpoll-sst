import { builder } from './builder';
import './poll-types'; // must run first — registers all poll types before union files evaluate
import './common';
import './types';
import './unions';
import './queries';
import './mutations';

builder.queryType({});
builder.mutationType({});
export const schema = builder.toSchema();
