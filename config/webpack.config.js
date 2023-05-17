const getConfig = require('./base.config');
const fse = require('fs-extra');
const path = require('path');
const childProcess = require('child_process');

const SSH_BASE = path.resolve(__dirname, '../build/ssh');
const KEY_FILE = path.join(SSH_BASE, 'key.pem');
const CSR_FILE = path.join(SSH_BASE, 'csr.pem');
const CERT_FILE = path.join(SSH_BASE, 'cert.pem');

function generateSSH() {
  fse.ensureDirSync(SSH_BASE);
  try {
    childProcess.execSync(`openssl x509 -checkend 86400 -noout -in ${CERT_FILE}`);
  } catch (error) {
    console.log('Cert not valid. Generating new one');
    childProcess.execSync(`openssl genrsa -out ${KEY_FILE}`);
    childProcess.execSync(`openssl req -subj '/CN=www.mydom.com/O=My Company Name LTD./C=US' -new -key ${KEY_FILE} -out ${CSR_FILE}`);
    childProcess.execSync(`openssl x509 -req -days 9999 -in ${CSR_FILE} -signkey ${KEY_FILE} -out ${CERT_FILE}`);
  }
}

generateSSH();

module.exports = [getConfig(false), getConfig(true)];
