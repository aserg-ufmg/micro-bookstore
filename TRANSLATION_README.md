# Micro Bookstore - English Translation

This is an English translation of the original [micro-livraria](https://github.com/aserg-ufmg/micro-livraria) repository.

## Original Repository
- **Original**: [micro-livraria](https://github.com/aserg-ufmg/micro-livraria)
- **Authors**: ASERG-UFMG
- **Translation**: Automated using Python script

## Translation Notes
- All documentation has been translated from Portuguese to English
- Code comments have been translated
- Variable names and function names remain mostly unchanged for compatibility
- JSON data files (like product information) have been translated

## Quick Start
The setup and execution remain the same as the original:

```bash
# Clone the repository
git clone <your-repo-url>

# Install dependencies
cd micro-bookstore
npm install

# Start all microservices
npm run start

# Access the frontend
# http://localhost:5000
```

## Architecture
This project demonstrates a microservices architecture with:
- **Frontend**: User interface
- **Controller**: Backend API gateway  
- **Shipping**: Shipping cost calculation service
- **Inventory**: Product inventory management service

## Practical Tasks
The repository includes two hands-on tasks:
1. **Task #1**: Implement a new operation in the Inventory microservice
2. **Task #2**: Create Docker containers for microservice deployment

For detailed instructions, please refer to the main README.md file.
