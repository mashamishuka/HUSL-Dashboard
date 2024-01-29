import { faker } from '@faker-js/faker'

// import { faker } from '@faker-js/faker/locale/de';

export type User = {
  userId: string
  username: string
  fullname: string
  email: string
  avatar: string
  password: string
  birthdate: Date
  registeredAt: Date
  phone: string
  gender?: string
}
export const USERS: User[] = []

export function createRandomUser() {
  return {
    userId: faker.datatype.uuid(),
    username: faker.internet.userName(),
    fullname: faker.name?.fullName(),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    password: faker.internet.password(),
    birthdate: faker.date.birthdate(),
    registeredAt: faker.date.past(),
    phone: faker.phone.number(),
    gender: faker.helpers.arrayElement(['Female', 'Male', 'Unknown'])
  }
}

Array.from({ length: 10 }).forEach(() => {
  USERS.push(createRandomUser())
})
