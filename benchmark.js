import { Bench } from 'tinybench'
import match from './lib.js'

const simpleObject_benchmark = async () => {
  const bench = new Bench({ time: 100 })

  const data = {
    firstName: 'foo',
    lastName: 'bar',
    age: 23,
    hobbies: ['sport', 'food', 'development', 'books']
  }

  bench
    .add('matchjs', _ => {
      // prettier-ignore
      const result = match(data)(
                {
                    firstName: String,
                    lastName: match.any,
                    hobbies: ['hiking']
                }, _ => "it's john!",

                {
                    firstName: String,
                    lastName: String,
                    hobbies: ['sport', 'food']
                }, _ => "it's foo!",

                {}, _ => ''
            )

      return result
    })
    .add('vanilla', _ => {
      let result = ''

      if (typeof data?.firstName === 'string') {
        if (
          typeof data?.lastName === 'string' &&
          data.hobbies?.includes('sport') &&
          data.hobbies?.includes('food')
        ) {
          result = "it's foo!"
        } else if (data?.lastName && data.hobbies?.includes('hiking')) {
          result = "it's john!"
        }
      }

      return result
    })

  await bench.run()

  return { name: 'simple object', table: bench.table() }
}

const shortArray_benchmark = async () => {
  const bench = new Bench({ time: 100 })

  const data = [
    {
      name: 'rob',
      age: new Date().getFullYear() - 2000,
      extra: [
        {
          type: 'weight',
          unit: 'kg',
          weight: 86
        },
        { type: 'movies', favorites: ['A great film', 'Bridge of Spies'] }
      ]
    },
    {
      name: 'jose',
      age: new Date().getFullYear() - 1995,
      extra: [
        {
          type: 'weight',
          unit: 'kg',
          weight: 67
        },
        {
          type: 'songs',
          favorites: [
            'Pink Floyd - The Great Gig in the Sky',
            'Megadeth - Angry Again'
          ]
        }
      ]
    },
    {
      name: 'michael',
      age: new Date().getFullYear() - 1962,
      extra: [
        {
          type: 'weight',
          unit: 'kg',
          weight: 112
        },
        { type: 'videogames', favorites: null }
      ]
    }
  ]

  bench
    .add('matchjs', _ => {
      // prettier-ignore
      const result = match(data) (
            [{
                name: undefined,
                age: Number,
                extra: match.any
            }], ([{ age }, ...others]) => `this any data has age: ${age} (others: ${others})`,

            [{
                name: String,
                age: match.cond(v => v > 20),
                extra: [{ type: 'movies' }]
            }], ([{ name, extra: [{ favorites }] }, ...others]) => `${name} likes movies: ${favorites} (others: ${others})`,

            Array, _ => `matching any array`,

            {}, _ => `nothing matched`
      )
      return result
    })
    .add('vanilla', _ => {
      let result = `nothing matched`

      for (let d of data) {
        if (!d.name && typeof d.age === 'number' && d.extra) {
          result = `this any data has age: ${d.age}`
        } else if (
          typeof d.name === 'string' &&
          d.age > 20 &&
          Array.isArray(d.extra) &&
          d.extra.some(
            item => item.type === 'movies' && Array.isArray(item.favorites)
          )
        ) {
          const favorites = d.extra.find(
            item => item.type === 'movies'
          ).favorites
          if (favorites) result = `${d.name} likes movies: ${favorites}`
        }
      }

      return result
    })

  await bench.run()

  return { name: 'short array', table: bench.table() }
}

const slightlyComplexObject_benchmark = async _ => {
  const bench = new Bench({ time: 100 })

  const data = {
    name: 'Alice Johnson',
    age: 28,
    address: {
      street: '456 Elm St',
      city: 'Los Angeles',
      zipcode: '90001',
      coordinates: {
        latitude: 34.0522,
        longitude: -118.2437
      }
    },
    email: 'alice@example.com',
    hobbies: ['Painting', 'Cooking'],
    friends: [
      {
        name: 'Emma',
        age: 26
      },
      {
        name: 'James',
        age: 29
      }
    ]
  }

  bench
    .add('matchjs', _ => {
      // prettier-ignore
      const result = match(data) (
      {
        age: Number,
        address: { 
          coordinates: {
            latitude: match.cond(v => v > 30 && v < 40)
          }
        }
      }, ({ age, address: coordinates }) => `found coordinates: ${coordinates} with age: ${age}`,

      {
        age: match.cond(v => v > 30),
        friends: [{ name: "Manuel" }]
      }, ({ age }) => `Manuel's friend is ${age}yo`,

      {}, _ => `nothing matched`
    )

      return result
    })
    .add('vanilla', _ => {
      let result = null

      if (
        typeof data?.age === 'number' &&
        data.address?.coordinates?.latitude > 30 &&
        data.address?.coordinates?.latitude < 40
      )
        result = `found coordinates: ${data.address.coordinates} with age: ${data.age}`
      else if (
        data?.age > 30 &&
        data?.friends?.filter(v => v.name === 'Manuel').length === 1
      )
        result = `Manuel's friend is ${data.age}yoo`

      return result
    })

  await bench.run()
  return { name: 'slightly complex object', table: bench.table() }
}

const complexObject_benchmark = async () => {
  const bench = new Bench({ time: 100 });

  const data = {
    user: {
      name: 'Alice',
      age: 30,
      email: 'alice@example.com',
    },
    orders: [
      { id: 1, total: 50 },
      { id: 2, total: 75 },
      { id: 3, total: 100 },
    ],
    address: {
      street: '123 Main St',
      city: 'Los Angeles',
    },
  };

  bench
    .add('matchjs', () => {
      // prettier-ignore
      const result = match(data)(
        {
          user: {
            name: String,
            age: Number,
            email: String,
          },
          orders: match.any,
          address: {
            city: 'Los Angeles',
          },
        }, ({ user: { name, age }, orders }) => `User ${name} is ${age} years old. Number of orders: ${orders.length}`,

        {}, _ => 'nothing matched'
      );
      return result;
    })
    .add('vanilla', () => {
      let result = 'No match found';

      if (
        data.user &&
        typeof data.user.name === 'string' &&
        typeof data.user.age === 'number' &&
        typeof data.user.email === 'string' &&
        Array.isArray(data.orders) &&
        data.address &&
        data.address.city === 'Los Angeles'
      ) {
        result = `User ${data.user.name} is ${data.user.age} years old. Number of orders: ${data.orders.length}`;
      }

      return result;
    });

  await bench.run();

  return { name: 'complex object', table: bench.table() };
};

;(async () => {
  const results = await Promise.all([
    simpleObject_benchmark(),
    shortArray_benchmark(),
    slightlyComplexObject_benchmark(),
    complexObject_benchmark()
  ])
  for (let result of results) {
    console.log(`[ ${result.name} ]`)
    console.table(result.table)
  }
})()
