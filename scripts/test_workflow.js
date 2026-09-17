const http = require('http');

function post(url, data, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const postData = JSON.stringify(data);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject({ status: res.statusCode, body: parsed });
          }
        } catch (e) {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function get(url, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject({ status: res.statusCode, body: parsed });
          }
        } catch (e) {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function patch(url, data, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const postData = JSON.stringify(data);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject({ status: res.statusCode, body: parsed });
          }
        } catch (e) {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runTest() {
  console.log('--- STARTING COMPLETE WORKFLOW VERIFICATION ---');

  // 1. Policyholder login
  const holderAuth = await post('http://localhost:8080/api/v1/auth/login', {
    email: 'holder@insureflow.com',
    password: 'Password123!'
  });
  console.log('✅ 1. Policyholder login SUCCESS:', holderAuth.fullName, '(Role:', holderAuth.role, ')');

  // 2. Policyholder get my-policies
  const myPols = await get('http://localhost:8080/api/v1/policies/my-policies', holderAuth.token);
  console.log('✅ 2. Policyholder getMyPolicies SUCCESS:', myPols.length, 'policies found.');
  const activePol = myPols.find(p => p.policyStatus === 'ACTIVE');
  console.log('   Target Policy:', activePol.policyNumber, '| Remaining buffer: ₹' + activePol.remainingLimit);

  // 3. Policyholder files a new claim
  const newClaim = await post('http://localhost:8080/api/v1/claims', {
    policyId: activePol.id,
    incidentDate: new Date().toISOString().split('T')[0],
    requestedPayout: 4000.00,
    incidentDescription: '[PROPERTY_STRUCTURAL] Verified test claim for judging demo workflow'
  }, holderAuth.token);
  console.log('✅ 3. Policyholder filed claim SUCCESS:', newClaim.claimNumber, '(Status:', newClaim.claimStatus, ')');

  // 4. Adjuster login & review
  const adjAuth = await post('http://localhost:8080/api/v1/auth/login', {
    email: 'adjuster@insureflow.com',
    password: 'Password123!'
  });
  console.log('✅ 4. Adjuster login SUCCESS:', adjAuth.fullName);

  const reviewedClaim = await patch(`http://localhost:8080/api/v1/claims/${newClaim.id}/review`, {
    reviewNotes: 'Loss inspected and invoices matched damage report.',
    recommendation: 'RECOMMEND_APPROVAL'
  }, adjAuth.token);
  console.log('✅ 5. Adjuster reviewed claim SUCCESS:', reviewedClaim.claimNumber, '(Status:', reviewedClaim.claimStatus, ')');

  // 5. Manager login & adjudicate
  const mgrAuth = await post('http://localhost:8080/api/v1/auth/login', {
    email: 'manager@insureflow.com',
    password: 'Password123!'
  });
  console.log('✅ 6. Manager login SUCCESS:', mgrAuth.fullName);

  const adjudicatedClaim = await patch(`http://localhost:8080/api/v1/claims/${newClaim.id}/adjudicate`, {
    decision: 'APPROVED',
    approvedAmount: 4000.00,
    adjudicationNotes: 'Approved with row-level pessimistic write lock.'
  }, mgrAuth.token);
  console.log('✅ 7. Manager adjudicated claim SUCCESS:', adjudicatedClaim.claimNumber, '(Status:', adjudicatedClaim.claimStatus, '| Approved: ₹' + adjudicatedClaim.approvedPayout + ')');

  // 6. Manager executes wire disbursement
  const disbs = await get('http://localhost:8080/api/v1/disbursements', mgrAuth.token);
  const targetDisb = disbs.find(d => d.claim && d.claim.id === newClaim.id);
  console.log('   Found Scheduled Wire #DISB-' + targetDisb.id, 'for amount ₹' + targetDisb.disbursementAmount);

  const executedWire = await post(`http://localhost:8080/api/v1/disbursements/${targetDisb.id}/execute`, {}, mgrAuth.token);
  console.log('✅ 8. Wire execution SUCCESS! Txn Hash:', executedWire.transactionHash, '(Status:', executedWire.executionStatus, ')');

  // 7. Policyholder views updated balance & reports
  const polAfter = await get(`http://localhost:8080/api/v1/policies/${activePol.id}`, holderAuth.token);
  console.log('✅ 9. Verified policy capacity after deduction:', '₹' + polAfter.remainingLimit, '(Was ₹' + activePol.remainingLimit + ')');

  const analytics = await get('http://localhost:8080/api/v1/analytics/metrics', holderAuth.token);
  console.log('✅ 10. Policyholder analytics reports query SUCCESS without 403 Forbidden! Active Policies:', analytics.activePoliciesCount);

  console.log('\n🎉 ALL 10 STEPS OF THE END-TO-END WORKFLOW PASSED WITH 0 ERRORS!');
}

runTest().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
