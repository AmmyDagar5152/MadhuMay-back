'use strict';

const gql = require('graphql-tag');

const typeDefs = gql`
  type AuthenticityCertificate {
    materialOrigin: String
    verifiedBy: String
  }

  type Product {
    id: ID!
    slug: String!
    name: String!
    subtitle: String
    devotionalContext: String
    price: Int!
    currency: String!
    images: [String!]!
    category: String!
    sampradaya: [String!]!
    material: String
    sourcingStory: String
    authenticity: AuthenticityCertificate
    inventory: Int!
  }

  type SevaSankalpTier {
    id: ID!
    name: String!
    priceAddOn: Int!
    description: String!
  }

  type Sampradaya { id: ID!, name: String! }
  type Category { slug: ID!, name: String! }

  type Article {
    slug: ID!
    title: String!
    excerpt: String
    image: String
    kicker: String
    readingTime: String
    publishedAt: String
    author: String
    body: [String!]!
  }

  type Festival {
    date: String!
    name: String!
    kind: String!
    note: String
  }

  type Subscriber { id: ID!, email: String!, createdAt: String! }

  type GiftingRecommendation {
    id: ID!
    narrative: String!
    products: [Product!]!
    createdAt: String!
  }

  type OrderItem {
    productSlug: String!
    productName: String!
    image: String
    price: Int!
    qty: Int!
    sevaName: String
    sevaPriceAddOn: Int
    lineTotal: Int!
  }

  type ShippingAddress {
    name: String!
    phone: String
    line1: String!
    line2: String
    city: String!
    state: String!
    pincode: String!
    country: String
  }

  type Order {
    id: ID!
    userId: ID
    userEmail: String
    items: [OrderItem!]!
    subtotal: Int!
    shipping: Int!
    total: Int!
    currency: String!
    status: String!
    address: ShippingAddress!
    note: String
    events: [OrderEvent!]!
    createdAt: String!
  }

  type OrderEvent {
    at: String!
    status: String!
    message: String
  }

  input OrderItemInput {
    productSlug: String!
    qty: Int!
    sevaId: String
  }

  input ShippingAddressInput {
    name: String!
    phone: String
    line1: String!
    line2: String
    city: String!
    state: String!
    pincode: String!
    country: String
  }

  input CreateOrderInput {
    items: [OrderItemInput!]!
    address: ShippingAddressInput!
    note: String
  }

  type OutboundEmail {
    id: ID!
    to: String!
    subject: String!
    kind: String!
    status: String!
    provider: String
    createdAt: String!
    previewText: String
  }

  type ReminderResult {
    sent: Int!
    festivalName: String
    festivalDate: String
    reason: String
  }

  input GiftingQuizInput {
    recipient: String!
    occasion: String!
    feeling: String!
    sampradaya: String
    budget: String!
  }

  type User {
    id: ID!
    email: String!
    name: String
    isAdmin: Boolean!
    provider: String
    altar: [String!]!
    altarProducts: [Product!]!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type RequestCodeResponse {
    ok: Boolean!
    # In development mode (no email provider configured), the code is echoed back for demo purposes.
    devCode: String
  }

  # Admin inputs
  input ProductInput {
    slug: String!
    name: String!
    subtitle: String
    devotionalContext: String
    price: Int!
    currency: String
    images: [String!]!
    category: String!
    sampradaya: [String!]!
    material: String
    sourcingStory: String
    materialOrigin: String
    verifiedBy: String
    inventory: Int!
  }

  input ArticleInput {
    slug: String!
    title: String!
    excerpt: String
    image: String
    kicker: String
    readingTime: String
    publishedAt: String
    author: String
    body: [String!]!
  }

  input FestivalInput {
    date: String!
    name: String!
    kind: String!
    note: String
  }

  type Query {
    health: String!
    products(category: String, sampradaya: [String!], sort: String): [Product!]!
    product(slug: ID!): Product
    articles: [Article!]!
    article(slug: ID!): Article
    sampradayas: [Sampradaya!]!
    categories: [Category!]!
    sevaTiers: [SevaSankalpTier!]!
    festivals(limit: Int): [Festival!]!
    upcomingFestivals(limit: Int): [Festival!]!
    me: User
    myOrders: [Order!]!
    myOrder(id: ID!): Order
    # Admin
    allSubscribers: [Subscriber!]!
    allUsers: [User!]!
    allOrders: [Order!]!
    outboundEmails(limit: Int): [OutboundEmail!]!
  }

  type Mutation {
    subscribeNewsletter(email: String!): Subscriber!
    submitGiftingQuiz(input: GiftingQuizInput!): GiftingRecommendation!

    # Auth (passwordless email code)
    requestSignInCode(email: String!): RequestCodeResponse!
    verifySignInCode(email: String!, code: String!): AuthPayload!
    signOut: Boolean!

    # Altar (wishlist)
    addToAltar(productSlug: String!): User!
    removeFromAltar(productSlug: String!): User!

    # Orders
    createOrder(input: CreateOrderInput!): Order!
    cancelOrder(id: ID!): Order!

    # Admin — requires isAdmin
    upsertProduct(input: ProductInput!): Product!
    deleteProduct(slug: String!): Boolean!
    upsertArticle(input: ArticleInput!): Article!
    deleteArticle(slug: String!): Boolean!
    upsertFestival(input: FestivalInput!): Festival!
    deleteFestival(date: String!, name: String!): Boolean!

    # Admin — orders + reminders
    setOrderStatus(id: ID!, status: String!, message: String): Order!
    sendEkadashiRemindersNow(force: Boolean): ReminderResult!
  }
`;

module.exports = { typeDefs };
