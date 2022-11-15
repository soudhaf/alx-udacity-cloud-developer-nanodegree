import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
//import Axios from 'axios'
//import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJaOPzo3eC5HpkMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1pZzhybWhpZC51cy5hdXRoMC5jb20wHhcNMjIxMDEyMjEwOTA5WhcN
MzYwNjIwMjEwOTA5WjAkMSIwIAYDVQQDExlkZXYtaWc4cm1oaWQudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3qM4OBWANFHTbr84
tSXt4+bzZk/rJgEOfFiYW1zrs8Ct8/5Mc15V6A7RvXfu3mtLggDDkw1qAcD1w0bP
o/sguG7YgVCWogo4iF2yUQxCpPoYqqF+MWyNqyJFe3aCFUwPFfRTQJnWmAjExaE0
2VhIqiQ4yWTkgpTjzvD1hd+1tzWI01w62XGYBQdnbujB49eLVTfYLQ7MhT5slUIq
u2e4WJljCrnwbDlmjlpsJ3eb2RDDdTx4KcKmLJ1wvrhI5M50fWKkQZAgo58K2cZd
J5w1f2FKN3EsmXcC/k0GWWbJIg6gTk/+wwi1ZMK6n5VNaRiJdPQU1MwG2jfnZx8I
51wjKQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSfu1hvNb4T
JTWPnBIsn72rk3g9rDAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AM4L/QQ5Y4Yd4vbFP0k/9HLvY+av3BFXkP2S1HGisbsdVpfWs7YIP7FbMoKSHmab
qo9cQfa4tyPkL4FsjPxnxio0EtVH2YRMVcxX8Bes7BPKyDKhvGghqfD+8QfPqxpZ
y+TZUVXGrhvbzqvlqOoCgdeTPmIunT9sWCm//f00lSXtfEf5DlcTX+GqaMNINDHN
B+DoO//iriKbANwWY5EOgcMHCtJwNtln9mIB+u4ejshJhZX+AGkB2irYyt15q9eu
A3YUxK3ZDjMLDHX5pE+wWj6cwGGeTKXY2gWzHMYUALdgGGinSr4MWpqNL818t4Ev
LcV+lJfWVZq9sP/tYjDcFTs=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): JwtPayload {
  const token = getToken(authHeader)

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}