import { DateResolver } from "graphql-scalars";
import { builder } from "../builder";

builder.addScalarType("Date", DateResolver, {});
