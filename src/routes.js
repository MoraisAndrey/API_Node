import { Database } from './database.js'
import { buildRoutePath } from "./utils/build-route-path.js"
import { randomUUID } from "node:crypto"

const database = new Database() 

export const routes = [
    {
        method: 'GET',
        path: buildRoutePath('/tasks'), 
        handler: (req, res) => {

            const { search } = req.query
            
            const tasks = database.select('tasks', search ? {
                id: search,
                title: search,

            } : null)
            
            return res.end(JSON.stringify(tasks))
        }
    },
    {
        method: 'POST',
        path: buildRoutePath('/tasks'), 
        handler: (req, res) => {

            const { title, description, created_at, completed_at } = req.body

            const task = {
                id: randomUUID(),
                title,
                description, 
                created_at: new Date().toISOString(),
                completed_at: null
            }

            database.insert('tasks', task)

            return res.writeHead(201).end()
        }
    },
    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'), 
        handler: (req, res) => {
            if (!req.body) {
                return res.writeHead(400).end(JSON.stringify({ error: 'Body is missing or invalid JSON' }))
            }

            const { id } = req.params
            const { title, description, updated_at } = req.body

            if (!title || !description) {
                return res.writeHead(400).end(JSON.stringify({ error: 'Title and description are required' }))
            }

            database.update('tasks', id, {
                title,
                description,
                updated_at: new Date().toISOString(),
            })
            return res.writeHead(204).end()
        },
            
    },
    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'), 
        handler: (req, res) => {
            const { id } = req.params

            database.delete('tasks', id) 
            
            return res.writeHead(204).end()
            
        }
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id/complete'), 
        handler: (req, res) => {
            const { id } = req.params

            const task = database.select('tasks').find(task => task.id === id)

            if (!task) {
                return res.writeHead(404).end(JSON.stringify({ error: 'Task not found' }))
            }

            if (task.completed_at) {
                return res.writeHead(400).end(JSON.stringify({ error: 'Task already completed' })) 
            }

            database.update('tasks', id, {
                completed_at: new Date().toISOString()
            })

            return res.writeHead(204).end()
        }
    }

]