export const config = {
    cognito: {
        userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
        clientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
        region: import.meta.env.VITE_COGNITO_REGION,
        domain: import.meta.env.VITE_COGNITO_DOMAIN,
        redirectUri: import.meta.env.VITE_COGNITO_REDIRECT_URI || window.location.origin + '/callback',
    },
    api: {
        baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
    }
};
