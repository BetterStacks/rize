# Security Policy

We take the security of this project seriously. Please do not file public issues for security vulnerabilities.

## Supported versions
- We support the `main` branch. No guaranteed support for older tags.

## Reporting a vulnerability
- Use GitHub's “Report a vulnerability” (Private Vulnerability Reporting) feature for this repository.
- Alternatively, you can open a GitHub Security Advisory draft addressed to the maintainers.
- If you cannot use GitHub, you may contact the maintainers privately via email. If an address is not listed in the repository profile, please open an issue requesting a security contact without disclosing details.

Please include:
- A detailed description of the issue and potential impact
- Steps to reproduce or a proof-of-concept
- Affected version/commit hash and environment details

## Our process
- We will acknowledge reports within 72 hours.
- We will work to reproduce and assess impact and scope.
- We will develop and test a fix, coordinate a release, and credit reporters if desired.

## Out of scope
- Vulnerabilities in third-party services or libraries we depend on (please report those upstream)
- Misconfigurations of your own deployment environment

## Best practices for deployments
- Keep secrets in environment variables; do not expose server-only secrets to the client.
- Rotate keys if you suspect exposure.
- Keep dependencies updated and monitor advisories.
