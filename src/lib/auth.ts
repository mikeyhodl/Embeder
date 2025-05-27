'use server'
import { cookies } from 'next/headers'

async function handleAuthResponse(response: Response) {
  if (!response.ok) {
    throw new Error(response.status.toString());
  }
  const data = await response.json();
  if (data && data.token) {
    cookies().set('Authtoken', JSON.stringify(data));
    await setUserDataCookie(data.token);
  } else {
    // console.error("Access token is missing or invalid.");
  }
  return data;
}

async function setUserDataCookie(token: string) {
  try {
    const response = await fetch(`${process.env.API_URL}/auth/user`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(response.status.toString());
    }

    const userData = await response.json();
    cookies().set('UserData', JSON.stringify(userData));
  } catch {
    // console.error("Failed to fetch user data");
  }
}

export async function AuthSignIn(username: string, password: string): Promise<void | number> {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, username }),
  };

  try {
    const response = await fetch(`${process.env.API_URL}/auth/login`, requestOptions);
    return await handleAuthResponse(response);
  } catch (error) {
    // console.error(error);
    return Promise.reject(error);
  }
}

export async function AuthSignUp(username: string, password: string, email: string, firstName: string, lastName: string): Promise<void> {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, email, firstName, lastName }),
  };

  try {
    const response = await fetch(`${process.env.API_URL}/auth/register`, requestOptions);
    return await handleAuthResponse(response);
  } catch {
    // console.error("Registration failed");
  }
}

export async function ResetPassword(email: string, newPassword: string): Promise<void> {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, newPassword }),
  };

  try {
    const response = await fetch(`${process.env.API_URL}/auth/reset-password`, requestOptions);
    if (!response.ok) {
      throw new Error(response.status.toString());
    }
    const data = await response.json();
    return data;
  } catch (error) {
    // console.error(error);
    return Promise.reject(error);
  }
}

export async function UpdateUser(username: string, email: string, firstName: string, lastName: string): Promise<void> {
  const Bearertoken = JSON.parse(cookies().get('Authtoken')?.value || '{}').token;

  if (!Bearertoken) {
    throw new Error('No token found. User must be authenticated.');
  }

  const requestOptions = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Bearertoken}`
    },
    body: JSON.stringify({ username, email, firstName, lastName }),
  };

  try {
    const response = await fetch(`${process.env.API_URL}/auth/update-user`, requestOptions);
    if (!response.ok) {
      throw new Error(response.status.toString());
    }
    const data = await response.json();
    await UpdateUserDataCookie(Bearertoken);
    return data;
  } catch (error) {
    // console.error(error);
    return Promise.reject(error);
  }
}

async function UpdateUserDataCookie(token: string): Promise<void> {
  try {
    const response = await fetch(`${process.env.API_URL}/auth/user`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(response.status.toString());
    }

    const userData = await response.json();
    cookies().set('UserData', JSON.stringify(userData));
  } catch {
    // console.error("Failed to update user data cookie");
  }
}

export async function ChangePassword(oldPassword: string, newPassword: string): Promise<void> {
  const Bearertoken = JSON.parse(cookies().get('Authtoken')?.value || '{}').token;

  if (!Bearertoken) {
    throw new Error('No token found. User must be authenticated.');
  }

  const requestOptions = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Bearertoken}`
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  };

  try {
    const response = await fetch(`${process.env.API_URL}/auth/change-password`, requestOptions);
    if (!response.ok) {
      throw new Error(response.status.toString());
    }
    const data = await response.json();
    return data;
  } catch (error) {
    // console.error(error);
    return Promise.reject(error);
  }
}