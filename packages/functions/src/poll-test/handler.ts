import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

const getHtmlPage = (userPoolId: string, userPoolClientId: string, region: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simpoll Poll Test</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container { max-width: 700px; margin: 0 auto; }
    .card {
      background: white;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    h1 { color: #11998e; margin-bottom: 10px; font-size: 28px; }
    h2 {
      color: #333;
      margin-bottom: 20px;
      font-size: 20px;
      border-bottom: 2px solid #11998e;
      padding-bottom: 10px;
    }
    .subtitle { color: #666; margin-bottom: 20px; font-size: 14px; }
    .form-group { margin-bottom: 15px; }
    label { display: block; margin-bottom: 5px; color: #333; font-weight: 500; font-size: 14px; }
    input[type=text], input[type=email], input[type=password], select, textarea {
      width: 100%;
      padding: 10px 12px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.3s;
      font-family: inherit;
    }
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: #11998e;
    }
    .toggle-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 15px;
    }
    .toggle-row label { margin: 0; }
    input[type=checkbox] { width: 18px; height: 18px; cursor: pointer; accent-color: #11998e; }
    button {
      padding: 10px 20px;
      background: #11998e;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover { background: #0d7a71; }
    button:disabled { background: #ccc; cursor: not-allowed; }
    .btn-secondary { background: #6c757d; }
    .btn-secondary:hover { background: #5a6268; }
    .btn-danger { background: #dc3545; padding: 6px 12px; font-size: 13px; }
    .btn-danger:hover { background: #c82333; }
    .btn-add { background: #28a745; margin-top: 10px; font-size: 14px; padding: 8px 16px; }
    .btn-add:hover { background: #218838; }
    .btn-save {
      width: 100%;
      padding: 14px;
      font-size: 17px;
      margin-top: 10px;
    }
    .message {
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 15px;
      font-size: 14px;
    }
    .error { background: #fee; color: #c33; border: 1px solid #fcc; }
    .success { background: #efe; color: #3c3; border: 1px solid #cfc; }
    .info { background: #eef; color: #33c; border: 1px solid #ccf; }
    .hidden { display: none; }
    .choice-row {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      margin-bottom: 12px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }
    .choice-row .choice-text { flex: 1; }
    .choice-media { display: flex; flex-direction: column; gap: 6px; min-width: 140px; }
    .choice-preview {
      width: 130px;
      height: 90px;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid #ccc;
      display: none;
    }
    .choice-file-label {
      display: inline-block;
      padding: 6px 12px;
      background: #e9ecef;
      border: 1px solid #ced4da;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      color: #495057;
      white-space: nowrap;
    }
    .choice-file-label:hover { background: #dee2e6; }
    .choice-file-input { display: none; }
    .media-type-badge {
      font-size: 11px;
      color: #666;
      padding: 2px 6px;
      background: #e9ecef;
      border-radius: 3px;
      display: none;
    }
    .results-box {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 20px;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 500px;
      overflow-y: auto;
    }
    .user-badge {
      display: inline-block;
      background: #11998e;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 13px;
      margin-bottom: 10px;
    }
    .config-info { font-size: 12px; color: #666; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e0e0e0; }
    .config-info strong { color: #333; }
    .progress-bar-wrap {
      background: #e9ecef;
      border-radius: 4px;
      height: 6px;
      margin-top: 4px;
      display: none;
    }
    .progress-bar {
      background: #11998e;
      height: 100%;
      border-radius: 4px;
      width: 0%;
      transition: width 0.2s;
    }
    .section-label {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #11998e;
      margin-bottom: 8px;
    }
    .giphy-row { display: flex; gap: 8px; align-items: center; margin-top: 6px; }
    .giphy-row input { flex: 1; font-size: 13px; }
    .giphy-row label { margin: 0; font-size: 12px; color: #666; white-space: nowrap; }
  </style>
</head>
<body>
<div class="container">

  <!-- Header -->
  <div class="card">
    <h1>🗳️ Simpoll Poll Test</h1>
    <p class="subtitle">Create and save polls with image or Giphy media uploads</p>
    <div class="config-info">
      <strong>User Pool:</strong> ${userPoolId}<br>
      <strong>Client ID:</strong> ${userPoolClientId}<br>
      <strong>Region:</strong> ${region}
    </div>
  </div>

  <!-- Sign In -->
  <div id="signinCard" class="card">
    <h2>Sign In</h2>
    <div id="signinMessage"></div>
    <div class="form-group">
      <label>Email, Phone, or Username</label>
      <input type="text" id="signinUsername" placeholder="alice@example.com">
    </div>
    <div class="form-group">
      <label>Password</label>
      <input type="password" id="signinPassword">
    </div>
    <button onclick="handleSignIn()">Sign In</button>
  </div>

  <!-- Poll Builder -->
  <div id="pollCard" class="card hidden">
    <h2>Build a Poll</h2>
    <div id="userBadge" class="user-badge"></div>

    <div id="pollMessage"></div>

    <div class="form-group">
      <label>Title</label>
      <input type="text" id="pollTitle" placeholder="What's your favourite...">
    </div>

    <div class="form-group">
      <label>Vote Privacy</label>
      <select id="votePrivacy">
        <option value="Anonymous">Anonymous</option>
        <option value="Named">Named</option>
      </select>
    </div>

    <div class="form-group">
      <label>Shared With (user IDs, comma-separated — leave empty for public)</label>
      <textarea id="sharedWith" rows="2" placeholder="user-id-1, user-id-2"></textarea>
    </div>

    <div class="form-group">
      <label>Expiry (ISO timestamp — optional)</label>
      <input type="text" id="expireTimestamp" placeholder="2026-06-01T00:00:00.000Z">
    </div>

    <div class="toggle-row">
      <input type="checkbox" id="multiSelect">
      <label for="multiSelect">Allow multiple selections</label>
    </div>

    <div class="toggle-row">
      <input type="checkbox" id="publishPoll" checked>
      <label for="publishPoll">Publish (uncheck to save as draft)</label>
    </div>

    <div class="section-label">Choices</div>
    <div id="choicesList"></div>
    <button class="btn-add" onclick="addChoice()">+ Add Choice</button>

    <br><br>
    <button class="btn-save" id="saveBtn" onclick="handleSavePoll()">Save Poll</button>
    <button class="btn-secondary" style="width:100%; margin-top:8px;" onclick="handleSignOut()">Sign Out</button>
  </div>

  <!-- Results -->
  <div id="resultsCard" class="card hidden">
    <h2>📋 Results</h2>
    <div id="resultsBox" class="results-box"></div>
  </div>

</div>

<script>
  const COGNITO_URL = 'https://cognito-idp.${region}.amazonaws.com/';
  const CLIENT_ID = '${userPoolClientId}';
  const GQL_URL = window.location.origin + '/graphql';

  async function cognitoRequest(target, body) {
    const res = await fetch(COGNITO_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.' + target,
      },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || json.__type || 'Unknown error');
    return json;
  }

  let idToken = null;
  let storedAccessToken = null;
  let choiceCount = 0;

  // ─── Auth ────────────────────────────────────────────────────────────────

  function showMessage(elementId, message, type) {
    const el = document.getElementById(elementId);
    el.innerHTML = \`<div class="message \${type}">\${message}</div>\`;
    if (type !== 'error') setTimeout(() => { el.innerHTML = ''; }, 8000);
  }

  async function handleSignIn() {
    try {
      const username = document.getElementById('signinUsername').value;
      const password = document.getElementById('signinPassword').value;
      const result = await cognitoRequest('InitiateAuth', {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: CLIENT_ID,
        AuthParameters: { USERNAME: username, PASSWORD: password },
      });
      idToken = result.AuthenticationResult.IdToken;
      storedAccessToken = result.AuthenticationResult.AccessToken;
      document.getElementById('signinCard').classList.add('hidden');
      document.getElementById('pollCard').classList.remove('hidden');
      document.getElementById('userBadge').textContent = '✅ Signed in';
      // Start with 2 default choices
      addChoice();
      addChoice();
    } catch (err) {
      showMessage('signinMessage', \`❌ \${err.message}\`, 'error');
    }
  }

  async function handleSignOut() {
    try {
      if (storedAccessToken) {
        await cognitoRequest('GlobalSignOut', { AccessToken: storedAccessToken });
      }
    } catch (_) {}
    idToken = null;
    document.getElementById('signinCard').classList.remove('hidden');
    document.getElementById('pollCard').classList.add('hidden');
    document.getElementById('resultsCard').classList.add('hidden');
    document.getElementById('choicesList').innerHTML = '';
    choiceCount = 0;
  }

  // ─── Choice management ───────────────────────────────────────────────────

  function addChoice() {
    choiceCount++;
    const id = choiceCount;
    const list = document.getElementById('choicesList');
    const div = document.createElement('div');
    div.className = 'choice-row';
    div.id = \`choice-\${id}\`;
    div.innerHTML = \`
      <div class="choice-text">
        <input type="text" placeholder="Choice \${id} text" id="choice-text-\${id}">
        <div class="giphy-row">
          <label>Giphy URL:</label>
          <input type="text" id="choice-giphy-\${id}" placeholder="https://media.giphy.com/...">
        </div>
      </div>
      <div class="choice-media">
        <label class="choice-file-label" for="choice-file-\${id}">📎 Image/Video</label>
        <input class="choice-file-input" type="file" id="choice-file-\${id}"
               accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
               onchange="onFileSelected(\${id})">
        <img id="choice-preview-\${id}" class="choice-preview" alt="preview">
        <span id="choice-badge-\${id}" class="media-type-badge"></span>
        <div class="progress-bar-wrap" id="choice-progress-wrap-\${id}">
          <div class="progress-bar" id="choice-progress-\${id}"></div>
        </div>
      </div>
      <button class="btn-danger" onclick="removeChoice(\${id})">✕</button>
    \`;
    list.appendChild(div);
  }

  function removeChoice(id) {
    const el = document.getElementById(\`choice-\${id}\`);
    if (el) el.remove();
  }

  function onFileSelected(id) {
    const input = document.getElementById(\`choice-file-\${id}\`);
    const preview = document.getElementById(\`choice-preview-\${id}\`);
    const badge = document.getElementById(\`choice-badge-\${id}\`);
    if (input.files && input.files[0]) {
      const file = input.files[0];
      badge.textContent = file.name.length > 18 ? file.name.slice(0, 15) + '…' : file.name;
      badge.style.display = 'inline-block';
      if (file.type.startsWith('image/')) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
      } else {
        preview.style.display = 'none';
      }
    }
  }

  // ─── GraphQL helpers ─────────────────────────────────────────────────────

  async function gql(query, variables) {
    const res = await fetch(GQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${idToken}\`,
      },
      body: JSON.stringify({ query, variables }),
    });
    const json = await res.json();
    if (json.errors) throw new Error(json.errors.map(e => e.message).join(', '));
    return json.data;
  }

  async function requestUploadUrl(contentType, fileSize) {
    const data = await gql(\`
      mutation RequestUploadUrl($contentType: String!, $fileSize: Int!) {
        requestUploadUrl(contentType: $contentType, fileSize: $fileSize) {
          uploadUrl
          assetId
          expiresIn
        }
      }
    \`, { contentType, fileSize });
    return data.requestUploadUrl;
  }

  async function uploadFileToS3(file, uploadUrl, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) onProgress(Math.round(e.loaded / e.total * 100));
      };
      xhr.onload = () => (xhr.status === 200 || xhr.status === 204) ? resolve() : reject(new Error(\`S3 upload failed: \${xhr.status}\`));
      xhr.onerror = () => reject(new Error('S3 upload network error'));
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  }

  // ─── Save Poll ───────────────────────────────────────────────────────────

  async function handleSavePoll() {
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';
    document.getElementById('pollMessage').innerHTML = '';

    try {
      // Gather choices, uploading any images first
      const choiceRows = document.querySelectorAll('.choice-row');
      const choices = [];

      for (const row of choiceRows) {
        const id = row.id.replace('choice-', '');
        const text = document.getElementById(\`choice-text-\${id}\`).value.trim();
        const giphyUrl = document.getElementById(\`choice-giphy-\${id}\`).value.trim();
        const fileInput = document.getElementById(\`choice-file-\${id}\`);
        const file = fileInput && fileInput.files[0];

        const choice = { text };

        // Giphy takes precedence over file if both provided
        if (giphyUrl) {
          choice.media = { type: 'Giphy', value: giphyUrl };
        } else if (file) {
          // Show progress bar
          const progressWrap = document.getElementById(\`choice-progress-wrap-\${id}\`);
          const progressBar = document.getElementById(\`choice-progress-\${id}\`);
          progressWrap.style.display = 'block';
          progressBar.style.width = '0%';

          // 1. Get presigned URL
          const { uploadUrl, assetId } = await requestUploadUrl(file.type, file.size);

          // 2. Upload directly to S3
          await uploadFileToS3(file, uploadUrl, (pct) => {
            progressBar.style.width = pct + '%';
          });

          progressBar.style.width = '100%';
          choice.media = { type: file.type.startsWith('video/') ? 'Video' : 'Image', value: assetId };
        }

        choices.push(choice);
      }

      // Build sharedWith array
      const sharedWithRaw = document.getElementById('sharedWith').value.trim();
      const sharedWith = sharedWithRaw
        ? sharedWithRaw.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const expireRaw = document.getElementById('expireTimestamp').value.trim();
      const multiSelect = document.getElementById('multiSelect').checked;
      const publish = document.getElementById('publishPoll').checked;
      const title = document.getElementById('pollTitle').value.trim();
      const votePrivacy = document.getElementById('votePrivacy').value;

      // 3. Call savePoll
      const SAVE_POLL_MUTATION = \`
        mutation SavePoll($input: SavePollInput!) {
          savePoll(input: $input) {
            pollId
            userId
            scope
            type
            title
            expireTimestamp
            votePrivacy
            sharedWith
            ct
            details {
              ... on MultipleChoiceDetail {
                multiSelect
                choices {
                  text
                  media {
                    type
                    value
                  }
                }
              }
            }
          }
        }
      \`;

      const input = {
        type: 'MultipleChoice',
        publish,
        title: title || undefined,
        sharedWith: sharedWith.length > 0 ? sharedWith : [],
        votePrivacy,
        expireTimestamp: expireRaw || undefined,
        multipleChoice: {
          multiSelect,
          choices,
        },
      };

      const data = await gql(SAVE_POLL_MUTATION, { input });

      // Show results
      document.getElementById('resultsCard').classList.remove('hidden');
      document.getElementById('resultsBox').textContent = JSON.stringify(data, null, 2);
      document.getElementById('resultsCard').scrollIntoView({ behavior: 'smooth' });
      showMessage('pollMessage', '✅ Poll saved successfully!', 'success');

    } catch (err) {
      showMessage('pollMessage', \`❌ \${err.message}\`, 'error');
      console.error(err);
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Poll';
    }
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
    headers: { 'Content-Type': 'text/html' },
    body: getHtmlPage(userPoolId, userPoolClientId, region),
  };
};
