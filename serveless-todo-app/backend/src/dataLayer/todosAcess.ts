import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

export class TodosAccess {

  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todoIndex = process.env.TODOS_CREATED_AT_INDEX
    ) {
  }

  async getUserTodos(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all todos for user', userId)

    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.todoIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async getUserTodoById(todoId: string, userId: string): Promise<TodoItem> {
    logger.info('Getting todo by id', todoId)
    
    const result = await this.docClient.query({
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId and todoId = :todoId',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':todoId': todoId
      }
    }).promise()

    const items = result.Items
    if (items.length !== 0) 
      return items[0] as TodoItem
    logger.warn(`No todo found with id ${todoId} for user ${userId}`)
    return null
  }


  async createTodo(todo: TodoItem): Promise<TodoItem> {
    logger.info('Creating todo', todo)
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()

    return todo
  }

  async updateTodo(todo: TodoUpdate, todoId: string, userId: string): Promise<void> {
    logger.info('Updating todo id', todoId)
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      UpdateExpression: "set done = :done, dueDate = :dueDate, #todo_name = :name",
      ExpressionAttributeValues: {
          ":done": todo.done,
          ":dueDate": todo.dueDate,
          ":name": todo.name
      },
      ExpressionAttributeNames: {
        "#todo_name": "name"
      }
    }).promise()
  }

  async setTodoAttachmentUrl(todoId: string, userId: string, attachmentUrl: string): Promise<void> {
     logger.info('Updating AttachmentUrl for todo', todoId)
     await this.docClient.update({
       TableName: this.todosTable,
       Key: {
         userId: userId,
         todoId: todoId
       },
       UpdateExpression: "set attachmentUrl = :attachmentUrl",
       ExpressionAttributeValues: {
           ":attachmentUrl": attachmentUrl
       }
     }).promise()
   }
 

  async deleteTodo(todoId: string, userId: string): Promise<void> {
    logger.info('Deleting todo', todoId)
    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      }
    }).promise()
  }
}
