import React, { createContext, useEffect, useMemo, useState } from 'react'
import { decodeToken, getToken } from './auth'

type AuthContextValue = {
  email?: string,
  username?: string,
  token?: string,
  ready: boolean
}

const AuthContext = createContext<AuthContextValue>({
  ready: false
})

const AuthProvider: React.FC<React.PropsWithChildren<{token?: string}>> = ({ token, children }) => {
  const auth = useMemo(() => token ? ({...decodeToken(token), token, ready: true}) : ({ready: false}), [token])
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider;