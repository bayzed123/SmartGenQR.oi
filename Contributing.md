# Contributing to SmartGen

Thank you for your interest in contributing to SmartGen! We welcome contributions from everyone. 
This document provides guidelines and instructions for contributing.

## Code of Conduct

* Be respectful and inclusive
* Provide constructive feedback
* Help others learn and grow
* Report issues professionally
* Follow the project's license

## Getting Started

### Prerequisites

* Node.js 18+ or higher
* pnpm package manager
* Git
* Basic knowledge of React/TypeScript (for code contributions)

### Setup Development Environment

```bash
# 1. Fork the repository
# Visit: [https://github.com/bayzed123/smartgenqr.oi/](https://github.com/bayzed123/smartgenqr.oi/fork)

# 2. Clone your fork
git clone [https://github.com/bayzed123/smartgenqr.oi/](https://github.com/bayzed123/smartgenqr.oi/fork)
cd smartgen-qr-generator

# 3. Add upstream remote
git remote add upstream [https://github.com/bayzed123/.git](https://github.com/bayzed123/smartgen-qr-generator.git)

# 4. Install dependencies
pnpm install

# 5. Create a feature branch
git checkout -b feature/your-feature-name

# 6. Start development server
pnpm dev
Development Workflow
1. Make Your Changes
• Write clean, readable code  
• Follow the existing code style  
• Add comments for complex logic  
• Update documentation as needed  
2. Test Your Changes

# [span_29](start_span)Run tests[span_29](end_span)
[span_30](start_span)pnpm test[span_30](end_span)

# [span_31](start_span)Check TypeScript[span_31](end_span)
[span_32](start_span)pnpm check[span_32](end_span)

# [span_33](start_span)Format code[span_33](end_span)
[span_34](start_span)pnpm format[span_34](end_span)

# [span_35](start_span)Build project[span_35](end_span)
[span_36](start_span)pnpm build[span_36](end_span)
3. Commit Your Changes
# [span_37](start_span)Use descriptive commit messages[span_37](end_span)
[span_38](start_span)git add .[span_38](end_span)
[span_39](start_span)git commit -m "feat: add new feature description"[span_39](end_span)
[span_40](start_span)git commit -m "fix: resolve issue description"[span_40](end_span)
[span_41](start_span)git commit -m "docs: update documentation"[span_41](end_span)
Commit Message Format:
• feat: New feature  
• fix: Bug fix  
• docs: Documentation  
• style: Code style changes  
• refactor: Code refactoring  
• test: Test additions/updates  
• chore: Build/dependency updates  
4. Push and Create Pull Request
# [span_49](start_span)Push to your fork[span_49](end_span)
[span_50](start_span)git push origin feature/your-feature-name[span_50](end_span)
• Create PR on GitHub  
• Provide clear description of changes  
• Reference related issues  
Pull Request Guidelines
Before Submitting
• [ ] Tests pass (pnpm test)  
• [ ] Code is formatted (pnpm format)  
• [ ] TypeScript checks pass (pnpm check)  
• [ ] Build succeeds (pnpm build)  
• [ ] No console errors/warnings  
PR Description Template
## Description
[span_59](start_span)Brief description of changes[span_59](end_span)

## Type of Change
- [ ] [span_60](start_span)Bug fix[span_60](end_span)
- [ ] [span_61](start_span)New feature[span_61](end_span)
- [ ] [span_62](start_span)Breaking change[span_62](end_span)
- [ ] [span_63](start_span)Documentation update[span_63](end_span)

## Related Issues
[span_64](start_span)Fixes #(issue number)[span_64](end_span)

## Testing
[span_65](start_span)Describe how you tested the changes[span_65](end_span)

## Screenshots (if applicable)
[span_66](start_span)Add screenshots for UI changes[span_66](end_span)

## Checklist
- [ ] [span_67](start_span)Code follows style guidelines[span_67](end_span)
- [ ] [span_68](start_span)Tests added/updated[span_68](end_span)
- [ ] [span_69](start_span)Documentation updated[span_69](end_span)
- [ ] [span_70](start_span)No breaking changes[span_70](end_span)
Code Style Guidelines
TypeScript/React
[span_71](start_span)// Use descriptive names[span_71](end_span)
[span_72](start_span)const generateQRCode = (data: string): void => {[span_72](end_span)
  [span_73](start_span)// Implementation[span_73](end_span)
[span_74](start_span)};[span_74](end_span)

[span_75](start_span)// Use type annotations[span_75](end_span)
[span_76](start_span)interface QROptions {[span_76](end_span)
  [span_77](start_span)width: number;[span_77](end_span)
  [span_78](start_span)height: number;[span_78](end_span)
  [span_79](start_span)color: string;[span_79](end_span)
[span_80](start_span)}

// Use const for immutability[span_80](end_span)
[span_81](start_span)const DEFAULT_SIZE = 300;[span_81](end_span)

[span_82](start_span)// Use arrow functions[span_82](end_span)
[span_83](start_span)const handleClick = () => {};[span_83](end_span)

[span_84](start_span)// Use destructuring[span_84](end_span)
[span_85](start_span)const { name, email } = user;[span_85](end_span)
CSS/Tailwind
[span_86](start_span)/* Use semantic class names */[span_86](end_span)
[span_87](start_span).qr-preview {}[span_87](end_span)
[span_88](start_span).download-button {}[span_88](end_span)
[span_89](start_span)/* Use Tailwind utilities */[span_89](end_span)
[span_90](start_span)<div className="flex items-center gap-4 p-6 rounded-lg bg-white border border-gray-200">[span_90](end_span)

[span_91](start_span)/* Avoid inline styles */[span_91](end_span)
[span_92](start_span)// Bad[span_92](end_span)
[span_93](start_span)<div style={{ color: 'red' }}>[span_93](end_span)

[span_94](start_span)// Good[span_94](end_span)
[span_95](start_span)<div className="text-red-500">[span_95](end_span)

File Organization
[span_96](start_span)src/[span_96](end_span)
[span_97](start_span)├── components/[span_97](end_span)
[span_98](start_span)│   ├── QRPreview.tsx[span_98](end_span)
[span_99](start_span)│   ├── ColorPicker.tsx[span_99](end_span)
[span_100](start_span)│   └── DownloadButton.tsx[span_100](end_span)
[span_101](start_span)├── pages/[span_101](end_span)
[span_102](start_span)│   ├── Home.tsx[span_102](end_span)
[span_103](start_span)│   └── Generator.tsx[span_103](end_span)
[span_104](start_span)├── hooks/[span_104](end_span)
[span_105](start_span)│   └── useQRCode.ts[span_105](end_span)
[span_106](start_span)├── types/[span_106](end_span)
[span_107](start_span)│   └── qr.ts[span_107](end_span)
[span_108](start_span)└── utils/[span_108](end_span)
    [span_109](start_span)└── qrGenerator.ts[span_109](end_span)
Bug Reports
How to Report
1.	Check if bug already exists  
2.	Use bug report template  
3.	Provide detailed information  
4.	Include screenshots/videos  
Bug Report Template
## Description
[span_114](start_span)Clear description of the bug[span_114](end_span)

## Steps to Reproduce
1. [span_115](start_span)Step one[span_115](end_span)
2. [span_116](start_span)Step two[span_116](end_span)
3. [span_117](start_span)Step three[span_117](end_span)

## Expected Behavior
[span_118](start_span)What should happen[span_118](end_span)

## Actual Behavior
[span_119](start_span)What actually happens[span_119](end_span)

## Environment
[span_120](start_span)Browser: Chrome 120[span_120](end_span)
[span_121](start_span)OS: Windows 11[span_121](end_span)
[span_122](start_span)Device: Desktop[span_122](end_span)

## Screenshots
[span_123](start_span)[Add screenshots if applicable][span_123](end_span)

## Additional Context
[span_124](start_span)[Any additional information][span_124](end_span)

Feature Requests
How to Request
1.	Check if feature already requested  
2.	Use feature request template  
3.	Explain use case clearly  
4.	Provide examples  
Feature Request Template
## Feature Description
[span_129](start_span)Clear description of the feature[span_129](end_span)

## Use Case
[span_130](start_span)Why is this feature needed?[span_130](end_span)

## Proposed Solution
[span_131](start_span)How should it work?[span_131](end_span)

## Alternative Solutions
[span_132](start_span)Other possible approaches[span_132](end_span)

## Additional Context
[span_133](start_span)[Any additional information][span_133](end_span)

Documentation
When to Update Docs
• New features  
• API changes  
• Bug fixes affecting usage  
• New examples/tutorials  
Documentation Files
• README.md - Main documentation  
• docs/API.md - API reference  
• docs/ARCHITECTURE.md - Architecture overview  
• docs/GETTING_STARTED.md - Getting started guide  
• CONTRIBUTING.md - Contributing guide (this file)  
Testing
Writing Tests
[span_143](start_span)import { describe, it, expect } from 'vitest';[span_143](end_span)

[span_144](start_span)describe('QR Code Generator', () => {[span_144](end_span)
  [span_145](start_span)it('should generate QR code for URL', () => {[span_145](end_span)
    [span_146](start_span)const result = generateQRCode('[https://example.com](https://example.com)');[span_146](end_span)
    [span_147](start_span)expect(result).toBeDefined();[span_147](end_span)
  [span_148](start_span)});[span_148](end_span)

  [span_149](start_span)it('should handle WiFi QR code', () => {[span_149](end_span)
    [span_150](start_span)const result = generateWiFiQR({[span_150](end_span)
      [span_151](start_span)ssid: 'MyNetwork',[span_151](end_span)
      [span_152](start_span)password: 'password123',[span_152](end_span)
      [span_153](start_span)encryption: 'WPA'[span_153](end_span)
    [span_154](start_span)});[span_154](end_span)
    [span_155](start_span)expect(result).toContain('WIFI:');[span_155](end_span)
  [span_156](start_span)});[span_156](end_span)
[span_157](start_span)});[span_157](end_span)

Running Tests
# [span_158](start_span)Run all tests[span_158](end_span)
[span_159](start_span)pnpm test[span_159](end_span)

# [span_160](start_span)Run specific test file[span_160](end_span)
[span_161](start_span)pnpm test src/utils/qrGenerator.test.ts[span_161](end_span)

# [span_162](start_span)Watch mode[span_162](end_span)
[span_163](start_span)pnpm test --watch[span_163](end_span)

# [span_164](start_span)Coverage[span_164](end_span)
[span_165](start_span)pnpm test --coverage[span_165](end_span)
Code Review Process
What We Look For
• [x] Code quality and readability  
• [x] Test coverage  
• [x] Documentation  
• [x] Performance impact  
• [x] Security considerations  
• [x] Browser compatibility  
Review Timeline
• Small changes: 1-2 days  
• Medium changes: 2-5 days  
• Large changes: 5-10 days  
Feedback
• Constructive and respectful  
• Actionable suggestions  
• Explanations for requests  
• Recognition of good work  
Release Process
Version Numbering
• MAJOR.MINOR.PATCH (e.g., 1.0.0)  
• MAJOR: Breaking changes  
• MINOR: New features  
• PATCH: Bug fixes  
Release Checklist
• [ ] All tests passing  
• [ ] Documentation updated  
• [ ] Changelog updated  
• [ ] Version bumped  
• [ ] Build successful  
• [ ] Release notes written  
Resources
Learning
• React Documentation  
• TypeScript Handbook  
• Tailwind CSS  
• Git Guide  
Tools
• VS Code  
• ESLint  
• Prettier  
• Vitest  
Thank You!
Your contributions make SmartGen better for everyone. We appreciate:  
• Bug reports  
• Feature suggestions  
• Code contributions  
• Documentation improvements  
• Spreading the word  
Questions?
• Email: cwb.agency@outlook.com
• GitHub Issues: Ask a question  
• Website: www.ConnectWithBayezid.it.com  
Happy Contributing!
Made with ❤️ by the SmartGen Community
