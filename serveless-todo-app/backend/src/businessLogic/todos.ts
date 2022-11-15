import { TodosAccess } from '../dataLayer/todosAcess'
import { getUploadUrl, getPublicUrl } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'


const todosAccess = new TodosAccess()

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  return await todosAccess.getUserTodos(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {

  const todoId = uuid.v4()

  return await todosAccess.createTodo({
    todoId: todoId,
    userId: userId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    createdAt: new Date().toISOString(),
    attachmentUrl: ''
  })
}

export async function updateTodo(updateTodoRequest: UpdateTodoRequest, todoId: string, userId: string): Promise<void>  {
    return await todosAccess.updateTodo({
        name: updateTodoRequest.name,
        dueDate: updateTodoRequest.dueDate,
        done: updateTodoRequest.done
    },
    todoId,
    userId)
}

export async function deleteTodo(todoId: string, userId: string): Promise<void>  {
    return await todosAccess.deleteTodo(todoId, userId)
}

export async function createAttachmentPresignedUrl(todoId: string, userId: string){
    const todo:TodoItem = await todosAccess.getUserTodoById(
      todoId,
      userId
      )

      if (!todo)
        return ''
      const attachmentUrl = getPublicUrl(todoId)
      await todosAccess.setTodoAttachmentUrl(todoId, userId, attachmentUrl)
    
    return getUploadUrl(todoId)
}