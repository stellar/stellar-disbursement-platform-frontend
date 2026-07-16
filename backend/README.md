# SDP Go Backend Services

This folder contains the Go backend services for the Stellar Disbursement Platform (SDP) project, including the Go SDP API Service and the Transaction Submission Service (TSS) daemon.

## Services Overview

1. **Go SDP API Service**: Core REST API handling user auth (JWT), CSV validation, disbursement tracking, and KYC status lookups.
2. **Transaction Submission Service (TSS)**: A worker service polling PostgreSQL for pending disbursements, packaging/signing Stellar transaction envelopes, and submitting them to Horizon.
3. **Database Schema**: Managed via PostgreSQL, under schemas like `sdp_proxies` and `sdp_proxy_deliveries`.

## Getting Started

Initialize your Go module and dependencies here:

```bash
go mod init backend
```
