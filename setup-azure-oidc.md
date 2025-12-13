# Azure OIDC Setup for GitHub Actions

This guide walks you through setting up federated credentials (OIDC) for GitHub Actions to deploy to Azure App Service without storing secrets.

## Prerequisites

- Azure CLI installed and logged in
- Owner or User Access Administrator role on the subscription
- Your GitHub repository: `DimitarGrozev/ParliamentAbsenceVisualizer`

## Setup Steps

### 1. Set Variables

```bash
SUBSCRIPTION_ID="bb0ed070-cc56-4ac2-a0ea-29300e5fe8c9"
RESOURCE_GROUP="dev-parliament-absence-visualizer-euw-rg"
APP_NAME="parliament-absence-visualizer"
GITHUB_ORG="DimitarGrozev"
GITHUB_REPO="ParliamentAbsenceVisualizer"
```

### 2. Create Azure AD Application and Service Principal

```bash
# Create the Azure AD application
APP_ID=$(az ad app create --display-name "github-parliament-absence-visualizer" --query appId -o tsv)

echo "Application (Client) ID: $APP_ID"

# Create a service principal for the application
az ad sp create --id $APP_ID

# Get the service principal object ID
SP_OBJECT_ID=$(az ad sp show --id $APP_ID --query id -o tsv)

echo "Service Principal Object ID: $SP_OBJECT_ID"
```

### 3. Assign Permissions to the Service Principal

```bash
# Assign Contributor role to the App Service
az role assignment create \
  --role Contributor \
  --assignee $APP_ID \
  --scope /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Web/sites/$APP_NAME

echo "✅ Assigned Contributor role to App Service"
```

### 4. Configure Federated Credentials for GitHub Actions

```bash
# For main branch deployments
az ad app federated-credential create \
  --id $APP_ID \
  --parameters '{
    "name": "github-deploy-main",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:'"$GITHUB_ORG"'/'"$GITHUB_REPO"':ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"],
    "description": "Deploy from main branch"
  }'

echo "✅ Configured federated credential for main branch"

# Optional: For pull request deployments (if you want to deploy PRs)
az ad app federated-credential create \
  --id $APP_ID \
  --parameters '{
    "name": "github-deploy-pr",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:'"$GITHUB_ORG"'/'"$GITHUB_REPO"':pull_request",
    "audiences": ["api://AzureADTokenExchange"],
    "description": "Deploy from pull requests"
  }'

echo "✅ Configured federated credential for pull requests"
```

### 5. Get Your Tenant ID

```bash
TENANT_ID=$(az account show --query tenantId -o tsv)

echo "Tenant ID: $TENANT_ID"
```

### 6. Summary - Values for GitHub Secrets

```bash
echo ""
echo "================================================"
echo "Add these secrets to your GitHub repository:"
echo "================================================"
echo "AZURE_CLIENT_ID: $APP_ID"
echo "AZURE_TENANT_ID: $TENANT_ID"
echo "AZURE_SUBSCRIPTION_ID: $SUBSCRIPTION_ID"
echo "================================================"
```

## Add Secrets to GitHub

1. Go to: https://github.com/DimitarGrozev/ParliamentAbsenceVisualizer/settings/secrets/actions
2. Click **New repository secret** and add each of these:

   - **Name**: `AZURE_CLIENT_ID`
     **Value**: (the APP_ID from above)

   - **Name**: `AZURE_TENANT_ID`
     **Value**: (the TENANT_ID from above)

   - **Name**: `AZURE_SUBSCRIPTION_ID`
     **Value**: `bb0ed070-cc56-4ac2-a0ea-29300e5fe8c9`

## Quick Setup Script (All-in-One)

Run this single command to set everything up:

```bash
# Set variables
SUBSCRIPTION_ID="bb0ed070-cc56-4ac2-a0ea-29300e5fe8c9"
RESOURCE_GROUP="dev-parliament-absence-visualizer-euw-rg"
APP_NAME="parliament-absence-visualizer"
GITHUB_ORG="DimitarGrozev"
GITHUB_REPO="ParliamentAbsenceVisualizer"

# Create app and service principal
APP_ID=$(az ad app create --display-name "github-parliament-absence-visualizer" --query appId -o tsv)
az ad sp create --id $APP_ID

# Assign permissions
az role assignment create \
  --role Contributor \
  --assignee $APP_ID \
  --scope /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Web/sites/$APP_NAME

# Configure federated credentials for main branch
az ad app federated-credential create \
  --id $APP_ID \
  --parameters '{
    "name": "github-deploy-main",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:'"$GITHUB_ORG"'/'"$GITHUB_REPO"':ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"],
    "description": "Deploy from main branch"
  }'

# Get tenant ID
TENANT_ID=$(az account show --query tenantId -o tsv)

# Print summary
echo ""
echo "================================================"
echo "✅ Setup Complete! Add these to GitHub Secrets:"
echo "================================================"
echo "AZURE_CLIENT_ID: $APP_ID"
echo "AZURE_TENANT_ID: $TENANT_ID"
echo "AZURE_SUBSCRIPTION_ID: $SUBSCRIPTION_ID"
echo "================================================"
echo ""
echo "Go to: https://github.com/$GITHUB_ORG/$GITHUB_REPO/settings/secrets/actions"
```

## How It Works

1. **No Secrets Stored**: GitHub Actions uses OpenID Connect (OIDC) to get short-lived tokens from Azure AD
2. **Automatic Token Refresh**: Tokens are automatically generated for each workflow run
3. **More Secure**: No long-lived credentials that can be leaked
4. **Zero Trust**: Azure validates that the request is coming from your specific GitHub repo and branch

## Benefits vs Service Principal with Secrets

✅ No secret rotation needed
✅ No risk of leaked credentials
✅ Tokens are short-lived (1 hour)
✅ Works only from your specific GitHub repo/branch
✅ Follows Microsoft's recommended approach

## Troubleshooting

### Error: "Failed to get access token"
- Verify all three secrets are added to GitHub
- Check that the federated credential subject matches your repo exactly
- Ensure permissions are set for `id-token: write` in the workflow

### Error: "Insufficient permissions"
- Verify the Contributor role was assigned correctly
- Check that you have the right subscription ID

### Test the Setup
Push a commit to the main branch and watch the GitHub Actions workflow run!
