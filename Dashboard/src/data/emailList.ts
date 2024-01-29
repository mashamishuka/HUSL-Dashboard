import { faker } from '@faker-js/faker'

// import { faker } from '@faker-js/faker/locale/de';

export type Email = {
  subject: string
  toCount: string
  excerpt: string
  sentAt: string | Date
  from: string
  opened: number
  clicked: number
  revenue: string
  sent: number
}
export const EMAILS: Email[] = []

export function createRandomEmail() {
  return {
    subject: faker.random.words(3),
    toCount: faker.random.numeric(3),
    excerpt: faker.random.words(3),
    sentAt: faker.date.past(),
    from: faker.name.firstName(),
    opened: faker.datatype.number({ max: 100, precision: 0.1 }),
    clicked: faker.datatype.number(100),
    revenue: faker.commerce.price(),
    sent: faker.datatype.number(100)
  }
}

Array.from({ length: 10 }).forEach(() => {
  EMAILS.push(createRandomEmail())
})
