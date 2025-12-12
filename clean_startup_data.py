import pandas as pd
import numpy as np
import json
import re
from pathlib import Path

def detect_header_row(df):
    """Automatically detect the header row by looking for common column name patterns."""
    # Common patterns that indicate a header row
    header_keywords = ['company', 'name', 'founded', 'year', 'location', 'industry', 
                      'funding', 'website', 'linkedin', 'description', 'startup']
    
    for idx, row in df.iterrows():
        row_str = ' '.join([str(val).lower() for val in row.values if pd.notna(val)])
        # Count how many header keywords appear in this row
        keyword_count = sum(1 for keyword in header_keywords if keyword in row_str)
        if keyword_count >= 3:  # If 3+ keywords found, likely a header
            return idx
    return 0  # Default to first row

def normalize_column_name(col_name):
    """Normalize column names to standard format."""
    if pd.isna(col_name) or col_name == '':
        return None
    
    col_lower = str(col_name).lower().strip()
    
    # Map common variations to standard names
    mappings = {
        'company': 'company_name',
        'company name': 'company_name',
        'name': 'company_name',
        'startup': 'company_name',
        'founded': 'founded_year',
        'founded year': 'founded_year',
        'year': 'founded_year',
        'location': 'location',
        'city': 'location',
        'industry': 'industry',
        'sector': 'industry',
        'funding': 'latest_funding',
        'latest funding': 'latest_funding',
        'funding amount': 'latest_funding',
        'website': 'website',
        'url': 'website',
        'linkedin': 'linkedin',
        'linkedin url': 'linkedin',
        'description': 'description',
        'about': 'description',
        'summary': 'description'
    }
    
    # Check for direct matches or partial matches
    for key, value in mappings.items():
        if key in col_lower or col_lower in key:
            return value
    
    # Check if it's an unnamed column
    if 'unnamed' in col_lower:
        return None
    
    return None

def clean_value(value):
    """Clean and normalize a single value."""
    # Handle pandas Series or other complex types
    if isinstance(value, pd.Series):
        value = value.iloc[0] if len(value) > 0 else None
    
    # Check for NaN/None/empty
    if pd.isna(value):
        return ""
    
    # Convert to string
    value_str = str(value)
    
    # Check if empty after conversion
    if value_str.strip() == '' or value_str == 'nan' or value_str == 'None':
        return ""
    
    # Strip whitespace
    cleaned = value_str.strip()
    
    # Remove extra whitespace
    cleaned = re.sub(r'\s+', ' ', cleaned)
    
    return cleaned

def is_valid_company_row(row):
    """Check if a row represents a valid company entry."""
    # A row is valid if it has at least a company name
    company_name = clean_value(row.get('company_name', ''))
    
    if not company_name or len(company_name) < 2:
        return False
    
    # Filter out obvious junk rows
    junk_patterns = ['total', 'summary', 'header', 'note:', 'source:', 
                    'data:', 'page', 'row', 'column']
    company_lower = company_name.lower()
    if any(pattern in company_lower for pattern in junk_patterns):
        return False
    
    return True

def process_excel_file(file_path):
    """Main function to process the Excel file."""
    print(f"Loading Excel file: {file_path}")
    
    # Try to read the Excel file
    try:
        # Read all sheets, use the first one
        df_raw = pd.read_excel(file_path, sheet_name=0, header=None)
        print(f"Loaded {len(df_raw)} rows, {len(df_raw.columns)} columns")
    except Exception as e:
        print(f"Error reading Excel file: {e}")
        return None
    
    # Detect header row
    header_idx = detect_header_row(df_raw)
    print(f"Detected header row at index: {header_idx}")
    
    # Re-read with detected header
    df = pd.read_excel(file_path, sheet_name=0, header=header_idx)
    
    # Clean column names
    column_mapping = {}
    for col in df.columns:
        normalized = normalize_column_name(col)
        if normalized:
            column_mapping[col] = normalized
    
    # Rename columns
    df = df.rename(columns=column_mapping)
    
    # Ensure all required columns exist, create empty ones if missing
    required_columns = ['company_name', 'founded_year', 'location', 'industry', 
                       'latest_funding', 'website', 'linkedin', 'description']
    
    # Keep only mapped columns that are in required_columns, add missing ones
    existing_cols = [col for col in df.columns if col in required_columns]
    df = df[existing_cols].copy()
    
    # Add missing columns with empty strings
    for col in required_columns:
        if col not in df.columns:
            df[col] = ""
    
    # Remove duplicate columns (keep first occurrence)
    df = df.loc[:, ~df.columns.duplicated()]
    
    # Reorder columns
    df = df[required_columns]
    
    # Clean all values - use astype(str) first to avoid Series comparison issues
    for col in df.columns:
        # Convert to string first, then clean
        df[col] = df[col].astype(str).apply(clean_value)
    
    # Filter out invalid rows
    print(f"Before filtering: {len(df)} rows")
    valid_mask = df.apply(is_valid_company_row, axis=1)
    df_clean = df[valid_mask].copy()
    print(f"After filtering: {len(df_clean)} rows")
    
    # Reset index
    df_clean = df_clean.reset_index(drop=True)
    
    return df_clean

def create_embedding_text(row):
    """Create embedding-ready text from company data."""
    parts = []
    
    # Access Series values - use .iloc or direct access
    def get_value(key):
        try:
            val = row.loc[key] if key in row.index else ''
            # Convert to string and clean
            if pd.isna(val):
                return ''
            val_str = str(val).strip()
            return val_str if val_str and val_str.lower() not in ['nan', 'none', ''] else ''
        except (KeyError, IndexError):
            return ''
    
    company_name = get_value('company_name')
    industry = get_value('industry')
    location = get_value('location')
    latest_funding = get_value('latest_funding')
    description = get_value('description')
    
    if company_name:
        parts.append(f"Company: {company_name}")
    if industry:
        parts.append(f"Industry: {industry}")
    if location:
        parts.append(f"Location: {location}")
    if latest_funding:
        parts.append(f"Funding: {latest_funding}")
    if description:
        parts.append(f"Description: {description}")
    
    return " | ".join(parts)

def main():
    # File paths
    excel_path = Path(r"C:\Users\sk777\OneDrive\Desktop\AI-resume-match-app\table\Startups that Sponsor - Mega List (by Alma).xlsx")
    output_dir = Path("data")
    output_dir.mkdir(exist_ok=True)
    
    # Process Excel file
    df_clean = process_excel_file(excel_path)
    
    if df_clean is None or len(df_clean) == 0:
        print("Error: No valid data found in Excel file")
        return
    
    # Save cleaned data as CSV
    csv_path = output_dir / "clean_companies.csv"
    df_clean.to_csv(csv_path, index=False)
    print(f"Saved cleaned data to: {csv_path}")
    
    # Save cleaned data as JSON
    json_path = output_dir / "clean_companies.json"
    df_clean.to_dict('records')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(df_clean.to_dict('records'), f, indent=2, ensure_ascii=False)
    print(f"Saved cleaned data to: {json_path}")
    
    # Create embedding text column
    df_clean['embedding_text'] = df_clean.apply(create_embedding_text, axis=1)
    
    # Save embedding-ready data
    embedding_path = output_dir / "companies_for_embeddings.csv"
    df_clean.to_csv(embedding_path, index=False)
    print(f"Saved embedding-ready data to: {embedding_path}")
    
    print(f"\nSummary:")
    print(f"Total companies: {len(df_clean)}")
    print(f"Companies with names: {df_clean['company_name'].str.len().gt(0).sum()}")
    print(f"Companies with industries: {df_clean['industry'].str.len().gt(0).sum()}")
    print(f"Companies with descriptions: {df_clean['description'].str.len().gt(0).sum()}")

if __name__ == "__main__":
    main()

