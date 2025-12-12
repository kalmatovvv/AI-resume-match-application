// // import { Amplify, Auth } from 'aws-amplify';

// const userPoolId =
//   process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || import.meta.env.VITE_COGNITO_USER_POOL_ID;
// const clientId =
//   process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || import.meta.env.VITE_COGNITO_CLIENT_ID;
// const region = process.env.NEXT_PUBLIC_AWS_REGION || import.meta.env.VITE_AWS_REGION || 'us-east-1';

// if (userPoolId && clientId && region) {
//   Amplify.configure({
//     Auth: {
//       region,
//       userPoolId,
//       userPoolWebClientId: clientId,
//       mandatorySignIn: false,
//       cookieStorage: {
//         domain: typeof window !== 'undefined' ? window.location.hostname : undefined,
//         path: '/',
//         secure: true,
//         sameSite: 'none'
//       }
//     }
//   });
// }

// export { Auth };







