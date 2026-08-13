const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

const emptyRobot = {
  reviewPeriod:'', totalLoans:'', loanTypes:'',
  sampleReviewed:'', sampleValue:'', findings:[], actionPlan:''
};

const seedFindings = [
  {id:1,title:"Wallet Compliance Assessment",cat:"Operations",status:"Open",days:142,flag:"Board",risk:"CDL–ROVA–FCMB data not synchronized in real-time. Inconsistent FCMB reporting creating reconciliation challenges.",action:"Reconcile data on CDL & ROVA ends. Push real-time data into ROVA. Enhance audit logs.",owner:"Mobile App Product Manager",update:""},
  {id:2,title:"Control Weakness – Alternative Number Reuse",cat:"Operations",status:"Open",days:129,flag:"Management",risk:"Same phone number can be added as alternative contact for multiple accounts without validation.",action:"Implement system control to flag or block reuse of same phone number across multiple accounts.",owner:"Head, Engineering/Solutions Architect",update:""},
  {id:3,title:"CBN Instant Payment Compliance — Fraud & Controls Gap Assessment",cat:"Operations",status:"Closed",days:114,flag:"Board",risk:"CBN circular mandated critical Instant Payment controls by July 1, 2026. Inflow fraud monitoring not implemented.",action:"Gap assessment completed. Time-bound remediation roadmap developed.",owner:"Team Lead, Risk Intelligence · Head of Products · Head, Engineering",update:""},
  {id:4,title:"Exposure of Sensitive Payload in Client-Side Storage",cat:"Technology",status:"Closed",days:null,flag:"Management",risk:"JWT tokens, full name, email, phone, financial system IDs and 2FA/PIN status exposed in local storage.",action:"Remove all auth tokens and PII from local storage. Migrate JWT to HttpOnly Secure cookies.",owner:"Head, Engineering/Solution Architect",update:""},
  {id:5,title:"Zeus Database – Inadequate Account Naming & Excessive Privileges",cat:"Technology",status:"Open",days:114,flag:"Management",risk:"Generic 'cdladmin' account lacks traceability. Lambda/S3/Comprehend assigned rds_superuser_role.",action:"Rename accounts for traceability. Revoke unnecessary rds_superuser_role privileges.",owner:"Head Enterprise Application & Database Support",update:""},
  {id:6,title:"Open CRC Issues on FEEX",cat:"Operations",status:"Closed",days:null,flag:"Management",risk:"140 open CRC issues between Jan–Feb 2026 exceeded 30-day resolution timeline.",action:"Enforce single source of truth for CRC queries. Profile resolvers on Feex.",owner:"Head, Digital Transformation",update:""},
  {id:7,title:"Double Disbursements to Clients with Conflicting Loan IDs",cat:"Operations",status:"Closed",days:null,flag:"Management",risk:"7 loans disbursed twice to clients with two loan IDs.",action:"Immediate loss recovery. Strengthen loan setup, validation, and disbursement controls.",owner:"Team Lead, Disbursement Management · Head, Enterprise Application",update:""},
  {id:8,title:"Multi-Profile Identity Exploitation",cat:"Operations",status:"Open",days:112,flag:"Management",risk:"Customers bypass 'One-User-One-Profile' by using NIN vs BVN with different phone numbers.",action:"Implement cross-referencing validation to link NIN and BVN to a single unique identity.",owner:"Head of Products · Head, Enterprise Application & Database Support",update:""},
  {id:9,title:"SME Lending: No Documented Legal/Compliance Assurance on Stock Financing",cat:"Operations",status:"Closed",days:null,flag:"Management",risk:"Stock Financing model not confirmed to fall within company licence.",action:"Obtain Legal and Compliance confirmation. Seek CBN clarification if needed.",owner:"Head, Digital Lending · Head, Legal Compliance and Governance",update:""},
  {id:10,title:"Customer Drop-Offs on Self-Service Channels",cat:"Operations",status:"Open",days:112,flag:"Management",risk:"Non-prequalified customers drop off USSD. Drop-off data not tracked or leveraged.",action:"Reinstate monitoring. Map referral codes to sales agents. Track conversion rates.",owner:"Lead, Customer Success and Experience · USSD Channel Product Manager",update:""},
  {id:11,title:"Ineffective Patch Management Testing Environment",cat:"Technology",status:"Closed",days:null,flag:"Management",risk:"Patch testing on Windows Server 2019 while production runs Windows Server 2023.",action:"Align test environment with production configuration.",owner:"Head, Infrastructure & Cloud Services",update:""},
  {id:12,title:"Inability to Update User Profiles on Nx360 V2",cat:"Technology",status:"Closed",days:null,flag:"Management",risk:"Certain user profiles cannot be updated, preventing affected users from logging in.",action:"Identify and resolve root cause. Implement system fix.",owner:"Head Enterprise Application & Database Support · Head, IT Quality Assurance",update:""},
  {id:13,title:"Client-Side Exposure of Encryption Key",cat:"Technology",status:"Closed",days:null,flag:"Management",risk:"NX360 V2 exposes encryption keys in client-side JavaScript.",action:"Eliminate exposure of encryption keys in frontend code. Enforce server-side key management.",owner:"Head, Engineering/Solutions Architect",update:""},
  {id:14,title:"SME Lending: Lack of Documented Fraud Risk Mitigants",cat:"Operations",status:"Closed",days:null,flag:"Management",risk:"LPO/CFF/IDF product paper identifies fraud risks but provides no documented controls.",action:"Update Fraud Risk section. Implement Duplicate Invoice Tracking.",owner:"Lead Business Analytics · Team Lead, Risk Intelligence",update:""},
  {id:15,title:"Logic Gaps in Automated Loan Approvals",cat:"Technology",status:"Closed",days:null,flag:"Management",risk:"System fails to recognise manual signatures, exceptional approvals over ₦1m, and educational officer rules.",action:"Update robot logic to handle manual signatures and specialised eligibility criteria.",owner:"Team Lead, Risk Intelligence",update:""},
  {id:16,title:"Pre-Liquidation Loan Closure Monitoring",cat:"Operations",status:"Closed",days:null,flag:"Management",risk:"Loan remained active after full customer settlement. Deductions continued. Closure is manual.",action:"Implement automated settlement detection and same-day loan closure logic.",owner:"Head, Engineering/Solutions Architect · Team Lead: Federal & State EDR",update:""},
  {id:17,title:"Ineffective Maker-Checker Controls in Refund",cat:"Operations",status:"Closed",days:null,flag:"Management",risk:"Same individual prepared and uploaded refund schedule, defeating maker-checker principle.",action:"Implement independent verification of refund computations. Enforce role segregation.",owner:"Team Lead: Federal & State EDR Transactions Management",update:""},
  {id:18,title:"Absence of Self-Service Loan Closure on Mobile App",cat:"Operations",status:"Closed",days:null,flag:"Management",risk:"No self-service loan closure capability. Contributes to prolonged refund cycles.",action:"Incorporate self-service loan settlement and closure feature into mobile app.",owner:"Head, Engineering/Solutions Architect · Team Lead: Federal & State EDR",update:""},
  {id:19,title:"Absence of Unique Identification Numbers for Customer Complaints",cat:"Operations",status:"Open",days:105,flag:"Management",risk:"Complaints not assigned unique reference numbers. Cannot track resolution status.",action:"Implement automated complaint ticketing with unique reference number on every complaint.",owner:"Lead, Customer Success and Experience",update:""},
  {id:20,title:"Strategic Review: Business Banking Web Control Gaps",cat:"Operations",status:"Open",days:105,flag:"Management",risk:"Unverified KYC, weak credential security, no maker-checker. Core banking misclassifies transactions.",action:"Enforce CAC uploads and maker-checker. Block weak passwords. Fix ledger mapping.",owner:"Head, Digital Lending · Head of Products",update:""},
  {id:21,title:"Long-Lived IAM Access Keys Without Rotation",cat:"Technology",status:"Closed",days:null,flag:"Management",risk:"Multiple IAM service accounts with active keys exceeding 90-day rotation period.",action:"Enforce automatic key rotation. Use temporary credentials (IAM roles) instead of static keys.",owner:"Head, Infrastructure & Cloud Services",update:""},
  {id:22,title:"Exposure of Sensitive Authentication Credentials in Source Code",cat:"Technology",status:"Closed",days:null,flag:"Management",risk:"3 live credential sets hardcoded in committed source code: Redis, WACS API, Apache Fineract.",action:"Rotate all three credential sets. Purge from git history. Migrate to AWS Secrets Manager.",owner:"Head Enterprise Application & Database Support",update:""},
  {id:23,title:"Weak Identity Governance – No Corporate Email Enforcement",cat:"Technology",status:"Closed",days:null,flag:"Management",risk:"Keycloak lacks domain restrictions. Developer accessed protected APIs via personal Gmail.",action:"Configure Keycloak to enforce corporate email domain whitelisting.",owner:"Head, Infrastructure & Cloud Services",update:""},
  {id:24,title:"Data Exposure: Session Replay & Log Integrity",cat:"Technology",status:"Closed",days:null,flag:"Management",risk:"Application logs expose live Bearer tokens, full API request details, and user identity in plain text.",action:"Implement sensitive data masking within logging middleware.",owner:"Head, Infrastructure & Cloud Services",update:""},
  {id:25,title:"Storage of Secret Keys in Plaintext – Middleware Database",cat:"Technology",status:"Open",days:74,flag:"Management",risk:"Sensitive access keys stored in Base64 without encryption.",action:"Migrate to secure vault. Encrypt keys at rest. Implement key rotation.",owner:"Head Enterprise Application & Database Support",update:""},
  {id:26,title:"Weak Access Control – Excessive Permissions in Middleware",cat:"Technology",status:"Open",days:74,flag:"Management",risk:"'Aduramimo Oludare' service has unrestricted 'ANY' access allowing all operations.",action:"Enforce least privilege. Implement RBAC.",owner:"Head Enterprise Application & Database Support",update:""},
  {id:27,title:"Absence of Verification Badge on Official Social Media Handles",cat:"Operations",status:"Open",days:74,flag:"Management",risk:"Instagram, Facebook, and TikTok official handles are not verified.",action:"Initiate and complete verification process for all official handles.",owner:"Head of Brand, Marketing & Corporate Communication",update:""},
  {id:28,title:"SportyBet/Football.com Inflow Pattern – Identity Theft & Fund Layering Risk",cat:"Operations",status:"Closed",days:null,flag:"Management",risk:"Fraudulent accounts opened via identity theft with inflows from SportyBet/Football.com.",action:"Implement transaction blocking for identified high-risk merchant patterns.",owner:"Head, Engineering/Solutions Architect",update:""},
  {id:29,title:"USSD Endpoint Exposure and Potential Data Exfiltration",cat:"Technology",status:"Closed",days:null,flag:"Management",risk:"~1GB anomalous outbound data pulled to external UK IP in 1 minute. 7,500 exploitation attempts.",action:"Implement strict egress filtering. Deploy WAF rules. Enable full request logging.",owner:"Head Enterprise Application & Database Support",update:""},
  {id:30,title:"Inadequate Network Segmentation Between Production and Test",cat:"Technology",status:"Closed",days:null,flag:"Management",risk:"Active VPC peering between production and test environments enabling network communication.",action:"Remove or restrict VPC peering. Implement strict network segmentation controls.",owner:"Head, Infrastructure & Cloud Services",update:""},
  {id:31,title:"NX360 v2 Code Vulnerability Assessment",cat:"Technology",status:"Open",days:70,flag:"Management",risk:"2,981 security vulnerabilities found in the NX360 v2 codebase.",action:"Isolate 3 unfixable Critical CVEs. Execute batch dependency upgrades.",owner:"Head, Engineering/Solutions Architect",update:""},
  {id:32,title:"Unauthorized Privilege Escalation Using Default Admin Account on Nx360 V2",cat:"Technology",status:"Closed",days:null,flag:"Management",risk:"Default account used to elevate all IT and QA users to 'Super User' without authorisation.",action:"Revoke all Super User access. Commence investigation. Ensure all actions logged.",owner:"Data Protection and IT Risk Control · Head, Engineering/Solutions Architect",update:""},
  {id:33,title:"Underwriting & Logic Gaps",cat:"Operations",status:"Closed",days:null,flag:"Management",risk:"Loans processed using unverified document uploads. FEDGO/DPL loans bypass underwriting.",action:"Automate data pulls from NX module. Upgrade routing bot to round-robin algorithm.",owner:"Head, Engineering/Solutions Architect · Head, Digital Transformation",update:""},
  {id:34,title:"No Documented SLA for Complaint Resolution",cat:"Operations",status:"Closed",days:null,flag:"Management",risk:"No formal SLA for complaint resolution, escalation timelines, or performance expectations.",action:"Develop and document Customer Complaint Resolution SLA and Escalation Framework.",owner:"Lead, Customer Success and Experience",update:""},
  {id:35,title:"Recurring Core-Wrapper Connection Pool Exhaustion",cat:"Technology",status:"Open",days:63,flag:"Management",risk:"Anomalous spike in connection errors over 2–3 months. Downstream calls fail under load.",action:"Validate stress and load tests. Review retry, timeout, and fail-fast configurations.",owner:"Head, Engineering/Solutions Architect · Head, IT Quality Assurance",update:""},
  {id:36,title:"Active Loans Disbursed with Incomplete Mandatory Customer Data",cat:"Operations",status:"Closed",days:null,flag:"Management",risk:"Active loans disbursed without mobile numbers, BVN, or staff/employee numbers.",action:"Remediate all affected records. Update missing BVN, mobile numbers, and employee number.",owner:"Team Lead: Disbursement Management · Head, Engineering/Solutions Architect",update:""},
  {id:37,title:"Erroneous Disbursement of Rejected Loans via V2 Platform",cat:"Operations",status:"Open",days:null,flag:"Management",risk:"8 previously rejected loans erroneously disbursed. Automated validation module dropped in transition.",action:"Recall 8 loans. Deploy auto-generation validation module. Review deployment checklist.",owner:"Head, IT Quality Assurance · Head of Product · Team Lead, Risk Intelligence",update:""},
  {id:38,title:"Core Application (NX360 V2) Capacity Constraint",cat:"Technology",status:"Open",days:54,flag:"Management",risk:"NX360 V2 experienced overload — intermittent service unavailability and delays.",action:"Assess and increase capacity. Optimize performance. Implement proactive monitoring.",owner:"Head, Infrastructure & Cloud Services · Head, Engineering/Solutions Architect",update:""},
  {id:39,title:"Wallet Interest Overpayment & Duplicate Posting Incident – 1 June",cat:"Finance",status:"Open",days:56,flag:"Management",risk:"495 customers impacted. Excess interest payments of ₦455,758.37.",action:"Investigate root cause. Recover excess payments. Implement validation controls.",owner:"Financial Controller · Head Enterprise Application & Database Support",update:""},
  {id:40,title:"Circumvention of Underwriting Controls – Incorrect Employer Classification",cat:"Operations",status:"Closed",days:null,flag:"Management",risk:"Sales agents booking FRSC loans under 'Paramilitary WASC' profile, bypassing FRSC underwriting reviews.",action:"Re-map accounts. Implement STK backend validation to block profile misclassification.",owner:"Head of Product · Head, Portfolio Management · Head, Engineering",update:""},
  {id:41,title:"Weak Customer Identity Validation During Wallet Onboarding",cat:"Operations",status:"Open",days:56,flag:"Management",risk:"Account onboarded as 'Franceklm Air' — BVN vs NIN name mismatch not flagged.",action:"Strengthen onboarding rules to ensure BVN, NIN, and customer name consistency.",owner:"Head of Product · Team Lead, Risk Intelligence · Head, Engineering",update:""},
  {id:42,title:"Employer Profiling & Maker-Checker Control",cat:"Operations",status:"Open",days:56,flag:"Management",risk:"No maker-checker for employer profiling. Employer creation date not captured.",action:"Implement mandatory maker-checker for all employer profile creation.",owner:"Team Lead, Risk Intelligence · Head, Engineering/Solutions Architect",update:""},
  {id:43,title:"Wallet Balance & Last-Transaction Ledger Mismatch",cat:"Technology",status:"Open",days:56,flag:"Management",risk:"Available and ledger balances do not match on NX360 v2. Transactions written out of order.",action:"Run data-remediation patch to recalculate and align broken wallet balances.",owner:"Head, Engineering/Solutions Architect",update:""},
  {id:44,title:"User Passwords Stored in Plaintext in Nx360 v2 Database",cat:"Technology",status:"Open",days:56,flag:"Management",risk:"User account passwords exposed in readable format — no cryptographic hashing.",action:"Implement industry-standard cryptographic hashing with salting.",owner:"Head, Engineering/Solutions Architect",update:""},
  {id:45,title:"Use of Shared Privileged Database Account",cat:"Technology",status:"Closed",days:null,flag:"Management",risk:"AppSupport database account used for general and admin activities — no user attribution.",action:"Enforce unique user accounts for all database access. Disable shared privileged accounts.",owner:"Head Enterprise Application & Database Support",update:""},
  {id:46,title:"NX360 Application-Level Data Validation Control Risk",cat:"Technology",status:"Open",days:49,flag:"Management",risk:"Invalid or duplicate information submitted for processing. Errors only caught at database layer.",action:"Enhance data validation logic and duplicate prevention mechanisms.",owner:"Head IT Quality Assurance · Head Engineering/Solutions Architect",update:""},
  {id:47,title:"Session Timeout Control Ineffectiveness on Nx360 V2",cat:"Technology",status:"Open",days:49,flag:"Board",risk:"Timeout countdown only starts when browser tab is actively visible. Session stays active indefinitely when minimised.",action:"Implement server-side session timeout independent of browser tab visibility.",owner:"Head IT Quality Assurance · Head Engineering/Solutions Architect",update:""},
  {id:48,title:"Duplicate Loan Booking Resulting in Double Disbursement",cat:"Operations",status:"Closed",days:null,flag:"Management",risk:"Sales agents booked multiple loans for same customer via STK same day despite system control.",action:"Recovery and closure complete. Technology team investigating root cause.",owner:"Team Lead, Disbursement Management · Head, Portfolio Management",update:""},
  {id:49,title:"Repayment Mandate and Collection Control Failures",cat:"Operations",status:"Open",days:49,flag:"Management",risk:"Data sync gaps between Lenda and NX Core. Failed Remita/NIBSS debits not auto-retried.",action:"Implement real-time data synchronization between Lenda and NX Core Banking System.",owner:"Head Collections & Recovery · Head of Products",update:""},
  {id:50,title:"Unverified System Overwrite of Customer Phone Numbers",cat:"Operations",status:"Open",days:49,flag:"Management",risk:"BVN phone number silently overrides profile during Tier 1 upgrade — no OTP check.",action:"Mandatory OTP validation whenever mismatch detected between login and BVN-linked phone numbers.",owner:"Head of Products · Head Engineering/Solutions Architect",update:""}
];

const seedLitigation = [
  {case:"Ihua Sylvanus v. Credit Direct Limited",year:"2019",claim:"Alleged wrongful deductions",liability:"₦0.4m (appeal)",status:"Judgment against Company. Appeal filed.",type:"deduction"},
  {case:"Joro Dang Dauda & Ors v. AG, CDL & Ors",year:"2022",claim:"Alleged fraudulent misrepresentations",liability:"Unascertainable",status:"Adjourned – 22nd October 2026 for defence.",type:"other"},
  {case:"Aminu Abdulaminu v. Credit Direct",year:"2022",claim:"Alleged over-deduction",liability:"₦35m",status:"Adjourned – 13 July 2026 (Hearing of application to set aside judgement)",type:"deduction"},
  {case:"Anietie Ekong & Anor. v. MTN Nigeria & 5 Ors",year:"2024",claim:"Fraudulent misrepresentation & defamation",liability:"₦3.55bn (shared across 6 defendants)",status:"Investigations concluded; position submitted to FCMB Legal.",type:"other"},
  {case:"Smart Christopher Obiagwu v. CDL & Ors",year:"2024",claim:"Defamation & unlawful lien",liability:"₦50m",status:"Adjourned 29 September 2026 for pre-trial conference.",type:"other"},
  {case:"Comrade Egba Henry Sunday v. Credit Direct Limited",year:"2025",claim:"Breach of fundamental human right (unlawful arrest)",liability:"TBD",status:"Adjourned for judgment. Date to be advised.",type:"other"},
  {case:"Agunbiade Nwadi Juliet v. Credit Direct",year:"2025",claim:"Alleged over-deductions",liability:"TBD",status:"Adjourned – 20th October 2026 for hearing of Claimant's application.",type:"deduction"},
  {case:"Sirajo Abdulkhadir Jelani v. CDL",year:"2026",claim:"Claim for over-deduction",liability:"₦1.3m",status:"Adjourned to 15 July 2026 for hearing of pending applications.",type:"deduction"},
  {case:"Mr Uguru Elias Ekuma v. Mr. Saheed Adigun & Credit Direct",year:"2026",claim:"Loan processed without customer consent (₦1,535,533.33)",liability:"TBD",status:"External solicitor engaged – Memorandum of appearance to be filed.",type:"origination"},
  {case:"Dr. Tanyi John Nkpot v. Credit Direct",year:"2026",claim:"Allegations of over-deduction",liability:"TBD",status:"External solicitor engaged – Memorandum of appearance to be filed.",type:"deduction"},
  {case:"Yakubu Salihu v. Credit Direct",year:"2026",claim:"Refund of payment (over-deduction)",liability:"₦0.2m",status:"Notice of Preliminary Objection filed. Adjourned to 9th July 2026.",type:"deduction"}
];

db.defaults({
  exec:[], internal:[], systems:[], robot:emptyRobot,
  legal:{regulatory:{},legalSupport:[],contracts:[],enforcement:[]},
  findings:[], litigation:[], archive:[]
}).write();

if (db.get('findings').value().length === 0) {
  db.set('findings', seedFindings).write();
  console.log('✅ Seeded 50 prior findings');
}
if (db.get('litigation').value().length === 0) {
  db.set('litigation', seedLitigation).write();
  console.log('✅ Seeded 11 litigation cases');
}

const app = express();
app.use(cors());
app.use(bodyParser.json({limit:'50mb'}));
app.use(express.static('public'));

app.get('/api/data', (req,res) => res.json(db.getState()));

app.post('/api/save/:section', (req,res) => {
  db.set(req.params.section, req.body).write();
  res.json({success:true});
});

app.delete('/api/clear/:section', (req,res) => {
  const s = req.params.section;
  const empty = s==='legal' ? {regulatory:{},legalSupport:[],contracts:[],enforcement:[]}
    : s==='robot' ? {...emptyRobot} : [];
  db.set(s, empty).write();
  res.json({success:true});
});

// Reset only clears weekly sections — findings & litigation carry forward
app.post('/api/reset', (req,res) => {
  db.set('exec',[]).set('internal',[]).set('systems',[])
    .set('robot',{...emptyRobot})
    .set('legal',{regulatory:{},legalSupport:[],contracts:[],enforcement:[]})
    .write();
  res.json({success:true});
});

app.get('/api/archive', (req,res) => {
  const archive = db.get('archive').value();
  res.json(archive.map(r => ({id:r.id, date:r.date, savedAt:r.savedAt})));
});

app.get('/api/archive/:id', (req,res) => {
  const r = db.get('archive').find({id:req.params.id}).value();
  if (!r) return res.status(404).json({error:'Not found'});
  res.json(r);
});

app.post('/api/archive', (req,res) => {
  const {date, html} = req.body;
  const id = Date.now().toString();
  db.get('archive').push({id, date, savedAt:new Date().toISOString(), html}).write();
  res.json({success:true, id});
});

app.delete('/api/archive/:id', (req,res) => {
  db.get('archive').remove({id:req.params.id}).write();
  res.json({success:true});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`CDL Audit running on port ${PORT}`));
