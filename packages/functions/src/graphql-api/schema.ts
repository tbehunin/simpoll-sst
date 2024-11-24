export const schema = `
type User {
    userId: ID!
    username: String!
    fullName: String!
    bio: String!
}
type Query {
    add(x: Int, y: Int): Int
    sub(x: Int, y: Int): Int
    user: User
}`;
