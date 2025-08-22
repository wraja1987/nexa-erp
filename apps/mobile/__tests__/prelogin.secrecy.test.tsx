import React from 'react'
import { render } from '@testing-library/react-native'
import App from '../App'

test('Login screen shows only email/password/forgot without module labels', async () => {
  const { queryByText, getByPlaceholderText } = render(<App />)
  expect(getByPlaceholderText('you@example.com')).toBeTruthy()
  expect(getByPlaceholderText('********')).toBeTruthy()
  expect(queryByText(/Dashboard/i)).toBeNull()
  expect(queryByText(/Billing/i)).toBeNull()
  expect(queryByText(/Developer Portal/i)).toBeNull()
  expect(queryByText(/Monitoring/i)).toBeNull()
  expect(queryByText(/Help/i)).toBeNull()
  expect(queryByText(/Settings/i)).toBeNull()
})


