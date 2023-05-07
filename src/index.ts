import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  return {
    statusCode: 200,
    body: "Hello World i am a lambda function",
  };
}
