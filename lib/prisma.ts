import { PrismaClient } from '@prisma/client'

function generateCustomId(modelName: string) {
  const prefix = modelName.substring(0, 3).toUpperCase()
  const randomNum = Math.floor(100000 + Math.random() * 900000)
  return `${prefix}-${randomNum}`
}

function createPrismaClient() {
  return new PrismaClient().$extends({
    query: {
      $allModels: {
        async create({ model, args, query }) {
          args.data = args.data || {}
          const data = args.data as { id?: string }
          if (!data.id) {
            data.id = generateCustomId(model)
          }
          return query(args)
        },
        async createMany({ model, args, query }) {
          if (args.data) {
            const dataArr = Array.isArray(args.data) ? args.data : [args.data]
            for (const item of dataArr) {
              const dataItem = item as { id?: string }
              if (!dataItem.id) {
                dataItem.id = generateCustomId(model)
              }
            }
          }
          return query(args)
        },
        async upsert({ model, args, query }) {
          if (args.create) {
            const createData = args.create as { id?: string }
            if (!createData.id) {
              createData.id = generateCustomId(model)
            }
          }
          return query(args)
        }
      }
    }
  })
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>

const globalForPrisma = global as unknown as { prisma: ExtendedPrismaClient }

const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma