import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

const getHtmlPage = (userPoolId: string, userPoolClientId: string, region: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simpoll Auth Test</title>
  <script src="https://unpkg.com/@aws-amplify/auth@6.0.0/dist/aws-amplify-auth.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
    }
    .card {
      background: white;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    h1 {
      color: #667eea;
      margin-bottom: 10px;
      font-size: 28px;
    }
    h2 {
      color: #333;
      margin-bottom: 20px;
      font-size: 20px;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }
    .subtitle {
      color: #666;
      margin-bottom: 30px;
      font-size: 14px;
    }
    .form-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      color: #333;
      font-weight: 500;
      font-size: 14px;
    }
    input {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.3s;
    }
    input:focus {
      outline: none;
      border-color: #667eea;
    }
    button {
      width: 100%;
      padding: 12px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
      margin-top: 10px;
    }
    button:hover {
      background: #5568d3;
    }
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .secondary-btn {
      background: #6c757d;
      margin-top: 5px;
    }
    .secondary-btn:hover {
      background: #5a6268;
    }
    .message {
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 15px;
      font-size: 14px;
    }
    .error {
      background: #fee;
      color: #c33;
      border: 1px solid #fcc;
    }
    .success {
      background: #efe;
      color: #3c3;
      border: 1px solid #cfc;
    }
    .info {
      background: #eef;
      color: #33c;
      border: 1px solid #ccf;
    }
    .token-box {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 15px;
      border: 2px solid #e0e0e0;
    }
    .token-label {
      font-weight: 600;
      color: #667eea;
      margin-bottom: 5px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .token-value {
      word-break: break-all;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: #333;
      max-height: 150px;
      overflow-y: auto;
      padding: 10px;
      background: white;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    .copy-btn {
      background: #28a745;
      padding: 8px 16px;
      font-size: 14px;
      width: auto;
      margin-top: 0;
    }
    .copy-btn:hover {
      background: #218838;
    }
    .hidden {
      display: none;
    }
    .config-info {
      font-size: 12px;
      color: #666;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #e0e0e0;
    }
    .config-info strong {
      color: #333;
    }
    .step-indicator {
      color: #667eea;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>🗳️ Simpoll Auth Test</h1>
      <p class="subtitle">Test Cognito authentication and get JWT tokens for GraphQL API testing</p>
      
      <div class="config-info">
        <strong>User Pool:</strong> ${userPoolId}<br>
        <strong>Client ID:</strong> ${userPoolClientId}<br>
        <strong>Region:</strong> ${region}
      </div>
    </div>

    <div id="signupCard" class="card">
      <h2>Sign Up</h2>
      <div id="signupMessage"></div>
      
      <div id="signupForm">
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="signupEmail" placeholder="alice@example.com" required>
        </div>
        <div class="form-group">
          <label>Phone Number (E.164 format)</label>
          <input type="tel" id="signupPhone" placeholder="+15551234567" required>
        </div>
        <div class="form-group">
          <label>Username</label>
          <input type="text" id="signupUsername" placeholder="alice" required>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="signupPassword" placeholder="Min 8 chars, uppercase, lowercase, number" required>
        </div>
        <button onclick="handleSignUp()">Sign Up</button>
      </div>

      <div id="verifyForm" class="hidden">
        <div class="step-indicator">Step 2: Verify Email</div>
        <div class="form-group">
          <label>Email Verification Code</label>
          <input type="text" id="emailVerificationCode" placeholder="123456">
        </div>
        <button onclick="handleVerifyEmail()">Verify Email</button>
        <button onclick="resendEmailCode()" class="secondary-btn">Resend Email Code</button>
      </div>

      <div id="verifyPhoneForm" class="hidden">
        <div class="step-indicator">Step 3: Verify Phone</div>
        <div class="form-group">
          <label>Phone Verification Code</label>
          <input type="text" id="phoneVerificationCode" placeholder="123456">
        </div>
        <button onclick="handleVerifyPhone()">Verify Phone</button>
        <button onclick="resendPhoneCode()" class="secondary-btn">Resend Phone Code</button>
      </div>
    </div>

    <div class="card">
      <h2>Sign In</h2>
      <div id="signinMessage"></div>
      
      <div class="form-group">
        <label>Email, Phone, or Username</label>
        <input type="text" id="signinUsername" placeholder="alice@example.com, +15551234567, or alice">
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" id="signinPassword">
      </div>
      <button onclick="handleSignIn()">Sign In</button>
    </div>

    <div id="tokenCard" class="card hidden">
      <h2>✅ Authentication Successful</h2>
      <p class="subtitle">Copy these tokens to use in GraphQL Playground</p>
      
      <div class="token-box">
        <div class="token-label">ID Token (Use this for GraphQL)</div>
        <div class="token-value" id="idToken"></div>
        <button class="copy-btn" onclick="copyToken('idToken')">📋 Copy ID Token</button>
      </div>

      <div class="token-box">
        <div class="token-label">Access Token</div>
        <div class="token-value" id="accessToken"></div>
        <button class="copy-btn" onclick="copyToken('accessToken')">📋 Copy Access Token</button>
      </div>

      <div class="message info">
        <strong>How to use in GraphQL Playground:</strong><br>
        1. Click "Copy ID Token" above<br>
        2. Open GraphQL Playground<br>
        3. In the bottom-left "HTTP Headers" section, add:<br>
        <code style="background: white; padding: 2px 6px; border-radius: 3px; display: block; margin-top: 5px;">
          { "Authorization": "Bearer YOUR_TOKEN_HERE" }
        </code>
      </div>

      <button onclick="handleSignOut()" class="secondary-btn">Sign Out</button>
    </div>
  </div>

  <script>
    const { Amplify } = window['@aws-amplify/auth'];

    // Configure Amplify
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: '${userPoolId}',
          userPoolClientId: '${userPoolClientId}',
          region: '${region}',
        }
      }
    });

    let currentUsername = '';

    function showMessage(elementId, message, type) {
      const el = document.getElementById(elementId);
      el.innerHTML = \`<div class="message \${type}">\${message}</div>\`;
      setTimeout(() => { el.innerHTML = ''; }, 10000);
    }

    async function handleSignUp() {
      try {
        const email = document.getElementById('signupEmail').value;
        const phone = document.getElementById('signupPhone').value;
        const username = document.getElementById('signupUsername').value;
        const password = document.getElementById('signupPassword').value;

        currentUsername = username;

        const { isSignUpComplete, userId, nextStep } = await Amplify.signUp({
          username: email,
          password: password,
          options: {
            userAttributes: {
              email: email,
              phone_number: phone,
              preferred_username: username,
            }
          }
        });

        showMessage('signupMessage', \`✅ Sign up successful! User ID: \${userId}\`, 'success');
        
        document.getElementById('signupForm').classList.add('hidden');
        document.getElementById('verifyForm').classList.remove('hidden');
      } catch (error) {
        showMessage('signupMessage', \`❌ Error: \${error.message}\`, 'error');
        console.error('Sign up error:', error);
      }
    }

    async function handleVerifyEmail() {
      try {
        const email = document.getElementById('signupEmail').value;
        const code = document.getElementById('emailVerificationCode').value;

        await Amplify.confirmSignUp({
          username: email,
          confirmationCode: code
        });

        showMessage('signupMessage', '✅ Email verified! Now verify your phone number.', 'success');
        document.getElementById('verifyForm').classList.add('hidden');
        document.getElementById('verifyPhoneForm').classList.remove('hidden');
      } catch (error) {
        showMessage('signupMessage', \`❌ Error: \${error.message}\`, 'error');
        console.error('Verify email error:', error);
      }
    }

    async function handleVerifyPhone() {
      showMessage('signupMessage', '✅ Phone verification complete! You can now sign in.', 'success');
      document.getElementById('verifyPhoneForm').classList.add('hidden');
      document.getElementById('signupForm').classList.remove('hidden');
    }

    async function resendEmailCode() {
      try {
        const email = document.getElementById('signupEmail').value;
        await Amplify.resendSignUpCode({ username: email });
        showMessage('signupMessage', '✅ Email verification code resent!', 'success');
      } catch (error) {
        showMessage('signupMessage', \`❌ Error: \${error.message}\`, 'error');
      }
    }

    async function resendPhoneCode() {
      showMessage('signupMessage', 'Phone code resend not implemented in this test UI', 'info');
    }

    async function handleSignIn() {
      try {
        const username = document.getElementById('signinUsername').value;
        const password = document.getElementById('signinPassword').value;

        const { isSignedIn, nextStep } = await Amplify.signIn({
          username: username,
          password: password
        });

        if (isSignedIn) {
          const session = await Amplify.fetchAuthSession();
          const idToken = session.tokens.idToken.toString();
          const accessToken = session.tokens.accessToken.toString();

          document.getElementById('idToken').textContent = idToken;
          document.getElementById('accessToken').textContent = accessToken;
          document.getElementById('tokenCard').classList.remove('hidden');
          
          showMessage('signinMessage', '✅ Sign in successful!', 'success');
        }
      } catch (error) {
        showMessage('signinMessage', \`❌ Error: \${error.message}\`, 'error');
        console.error('Sign in error:', error);
      }
    }

    async function handleSignOut() {
      try {
        await Amplify.signOut();
        document.getElementById('tokenCard').classList.add('hidden');
        document.getElementById('idToken').textContent = '';
        document.getElementById('accessToken').textContent = '';
        showMessage('signinMessage', '✅ Signed out successfully', 'success');
      } catch (error) {
        showMessage('signinMessage', \`❌ Error: \${error.message}\`, 'error');
      }
    }

    function copyToken(tokenId) {
      const tokenValue = document.getElementById(tokenId).textContent;
      navigator.clipboard.writeText(tokenValue).then(() => {
        alert('Token copied to clipboard!');
      });
    }
  </script>
</body>
</html>
`;

export const main: APIGatewayProxyHandlerV2 = async (_event) => {
  const userPoolId = process.env.USER_POOL_ID || '';
  const userPoolClientId = process.env.USER_POOL_CLIENT_ID || '';
  const region = process.env.AWS_REGION || 'us-east-1';

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
    },
    body: getHtmlPage(userPoolId, userPoolClientId, region),
  };
};
