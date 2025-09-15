# Project Configuration

## File Access Restrictions
- **NEVER read *.env files** in this directory or any subdirectories
- **SECURITY**: Environment files may contain sensitive credentials and secrets
- **SCOPE**: This restriction applies to all .env, .env.local, .env.production, .env.development, etc.

## Character Encoding
- **ALWAYS use UTF-8 encoding for all file operations and text processing**
- **MANDATORY**: Set `export LANG=ja_JP.UTF-8` at the start of any session involving Japanese text
- **MANDATORY**: Use `export LC_ALL=ja_JP.UTF-8` before running any commands with Japanese text
- **FILE CREATION**: When creating files containing Japanese characters, ensure UTF-8 encoding is preserved
- **VERIFICATION**: Use `file <filename>` to verify UTF-8 encoding after creating/editing files with Japanese text
- **TERMINAL**: Ensure terminal supports UTF-8 display for proper Japanese character rendering

## Test Commands
- Test command: `npm test`
- Run specific test: `npm test -- <test-file>`

## Development Notes
- This project contains Japanese text and requires proper UTF-8 handling
- When running tests or viewing output, ensure terminal supports UTF-8

## Claude Code UTF-8 Setup
- **IMPORTANT**: Before starting any work session, run: `export LANG=ja_JP.UTF-8 && export LC_ALL=ja_JP.UTF-8`
- **FILE EDITING**: Always verify encoding after editing files with Japanese content using: `file <filename>`
- **TROUBLESHOOTING**: If Japanese characters appear corrupted, rewrite the file with proper UTF-8 encoding

## Claude Code Security Settings
- **PROHIBITED**: Do not read any files matching *.env pattern anywhere in this project
- **INCLUDES**: .env, .env.local, .env.production, .env.development, .env.test, etc.
- **REASON**: Environment files contain sensitive configuration data and credentials