
import * as fs from 'fs'
import * as path from 'path'
import { config } from 'dotenv'

config()

console.log('--- ENV CHECK ---')
console.log('AUTH_SECRET exists:', !!process.env.AUTH_SECRET)
console.log('AUTH_URL:', process.env.AUTH_URL)
console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 20))
console.log('--- FILE CONTENT ---')
const content = fs.readFileSync('.env', 'utf8')
console.log('Length:', content.length)
console.log('First 5 bytes:', [...Buffer.from(content.substring(0, 5))].map(b => b.toString(16)).join(' '))
