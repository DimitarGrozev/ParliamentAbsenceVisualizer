# Build stage: .NET SDK with Node.js
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Install Node.js for frontend build (triggered by MSBuild)
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Copy everything
COPY . .

# Publish (MSBuild will run npm ci + npm build via BuildFrontend target)
RUN dotnet publish backend/ParliamentAbsenceVisualizer.Api.csproj -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS runtime
WORKDIR /app

COPY --from=build /app/publish ./

ENV ASPNETCORE_URLS=http://+:${PORT:-8080}
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

ENTRYPOINT ["dotnet", "ParliamentAbsenceVisualizer.Api.dll"]
