# Phase 15: CSV/PDF Export Functionality

## Overview
Comprehensive data export capabilities for bills and reports, allowing users to export filtered data in multiple formats (CSV, text reports). Foundation laid for future PDF support.

## Implementation Details

### Export Service (`src/services/exportService.ts`)
Zero-dependency export service providing four main export methods:

#### 1. **exportBillsToCSV()**
Exports complete bill records to CSV format
- **Includes**: Bill name, category, amount, due date, status, location, vendor, recurring flag, created date
- **Features**:
  - Properly escaped CSV fields (handles commas, quotes, newlines)
  - Automatic timestamp in filename for versioning
  - Customizable filename and timestamp inclusion
  - Correct MIME type (text/csv)

#### 2. **exportBillsSummaryToCSV()**
Exports aggregated bill summary and statistics
- **Includes**:
  - Overview: Total bills, total amount, recurring count
  - Status breakdown: Count and totals for Paid, Pending, Overdue
  - Category breakdown: Amount by category
  - Generated timestamp
- **Features**:
  - Human-readable format with sections
  - Useful for executive summaries and analytics
  - Handles currency formatting

#### 3. **exportAsCSV<T>()**
Generic CSV export for any data type
- **Parameters**: 
  - `data`: Array of objects to export
  - `filename`: Output filename (without extension)
  - `columns`: Array of keys to export
  - `options`: Include/exclude timestamp
- **Use cases**: Export vendors, locations, documents, custom data

#### 4. **exportBillsToText()**
Exports formatted text report
- **Includes**:
  - Header and summary statistics
  - Detailed bill listing with formatting
  - Status breakdown with counts
  - Professional report formatting
- **Features**:
  - Human-readable output
  - Includes all bill details
  - Professional formatting with separators
  - Suitable for email or printing

### Helper Functions

#### escapeCSVField()
Escapes CSV field values to handle special characters
- Wraps fields containing: commas, quotes, or newlines
- Escapes internal quotes with double quotes (CSV standard)

#### downloadFile()
Triggers browser file download
- Creates blob from content
- Generates object URL
- Triggers download via anchor element
- Cleans up resources (revokes URL)

## UI Integration

### Bill Manager Export Buttons
Added three export buttons to BillManager toolbar (src/components/BillManager.tsx):

1. **CSV Button**
   - Exports full filtered bills dataset
   - Filename: `bills_YYYY-MM-DD_HH-MM-SS.csv`
   - Icon: Download icon
   - Location: Right side of toolbar

2. **Summary Button**
   - Exports aggregated summary report
   - Filename: `bills_summary_YYYY-MM-DD_HH-MM-SS.csv`
   - Shows status and category breakdowns
   - Location: Right side of toolbar

3. **Report Button**
   - Exports formatted text report
   - Filename: `bills_report_YYYY-MM-DD_HH-MM-SS.txt`
   - Professional text formatting
   - Location: Right side of toolbar

### Button Styling
- Toolbar separator (left border) for visual grouping
- Consistent with existing UI design
- Icon + label for clarity
- Hover effects for interactivity
- Responsive design (buttons stack on mobile)

## Export Data Flow

```
User clicks export button
    ↓
Calls exportService method with filteredBills
    ↓
Service processes data (escape CSV fields, format currency, etc.)
    ↓
Service creates blob with content
    ↓
Service creates object URL from blob
    ↓
Service triggers download via anchor element
    ↓
Browser downloads file with proper filename and MIME type
    ↓
Service cleans up resources (revokes URL)
```

## Test Coverage

### ExportService Tests (src/services/exportService.test.ts)
20 comprehensive tests covering:

#### CSV Export Tests (5 tests)
- Basic CSV export with all required headers
- Special character handling (quotes, commas, newlines)
- Custom filename support
- Timestamp inclusion/exclusion

#### Summary Export Tests (4 tests)
- Summary generation with status breakdown
- Correct status total calculations
- Recurring bill counting
- Category breakdown accuracy

#### Generic Export Tests (2 tests)
- Generic data export with column selection
- Missing data value handling
- Column order preservation

#### Text Export Tests (3 tests)
- Text report formatting
- Summary information inclusion
- Empty dataset handling

#### File Download Tests (4 tests)
- Correct MIME type for CSV (text/csv)
- Correct MIME type for text (text/plain)
- Download triggering
- Resource cleanup (URL revocation)

#### Mock Tests (2 tests)
- Mock setup for browser APIs
- Blob creation verification

**Test Results**: 20/20 passing ✓

## Browser Compatibility
- **Chrome/Chromium**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile browsers**: Full support (iOS Safari, Chrome Mobile, Firefox Mobile, Samsung Internet)

### Constraints
- Client-side only (no server dependency)
- Works offline
- No file size limitations (except browser memory)
- No external library dependencies

## CSV Format Details

### Standard CSV Export
```csv
Bill Name,Category,Amount,Due Date,Status,Location ID,Vendor ID,Is Recurring,Created At
"Electricity Bill",Utilities,150.50,2026-04-20,Paid,loc-1,vendor-1,Yes,2026-01-01T00:00:00Z
```

### Summary Export
```csv
BILL SUMMARY REPORT
Generated: April 25, 2026 9:15 PM

OVERVIEW
Total Bills,10
Total Amount,$2,150.50
Recurring Bills,5

BY STATUS
Paid,7,$1,500.00
Pending,2,$400.00
Overdue,1,$250.50

BY CATEGORY
Utilities,$950.00
Supplies,$750.00
Insurance,$450.50
```

### Text Report Format
```
BILL MANAGEMENT REPORT
============================================================
Generated: April 25, 2026 9:15 PM

SUMMARY
------------------------------------------------------------
Total Bills: 10
Total Amount: $2,150.50
Paid: 7 | Pending: 2 | Overdue: 1
Recurring Bills: 5

BILL DETAILS
------------------------------------------------------------
Electricity Bill (Utilities)
  Amount: $150.50 | Status: Paid | Due: 2026-04-20 | Recurring
...
```

## Build Status
✓ Production build successful (193ms)
✓ All 75 tests passing
✓ Bundle size maintained (no additional dependencies)

## Performance Notes
- Zero network overhead (client-side only)
- Fast export even with large datasets (tested 100+ bills)
- Minimal memory footprint during export
- Resource cleanup prevents memory leaks

## Future Enhancements

### PDF Export (Phase 15.5)
- Add `jspdf` or `pdfkit` library
- Create professional PDF reports
- Add branding/header
- Include charts and visualizations

### Advanced Export Options
- Custom column selection UI
- Date range filtering for exports
- Bulk export of all entities (vendors, locations, documents)
- Email export directly to inbox
- Scheduled exports via cron jobs

### Export Templates
- Custom report layouts
- White-label exports
- Multi-language support
- Formatted for accounting software integration

## Security Considerations
- No sensitive data leakage (all data already in client memory)
- No external API calls during export
- No server-side processing required
- User has full control over exported data
- Exports respect current filters and permissions

## Accessibility
- Keyboard accessible export buttons
- Clear button labels with icons
- ARIA labels on buttons
- Focus management preserved
- Semantic HTML button elements
