import os
import zipfile
import sys

def make_zip(source_dir, output_zip):
    exclude_dirs = {
        'node_modules',
        '.git',
        '.gradle',
        'build',
        '__pycache__',
        '.turbo',
        '.next'
    }
    exclude_extensions = {
        '.pyc',
        '.log'
    }

    print(f"Creating zip archive: {output_zip}")
    total_files = 0
    total_bytes = 0

    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            # Filter out excluded directories in-place
            dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith('.')]
            
            for file in files:
                if any(file.endswith(ext) for ext in exclude_extensions):
                    continue
                if file.endswith('.zip'):
                    continue
                
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, source_dir)
                
                # Check if any parent part of rel_path is in exclude_dirs
                parts = rel_path.split(os.sep)
                if any(part in exclude_dirs for part in parts):
                    continue

                size = os.path.getsize(full_path)
                zipf.write(full_path, rel_path)
                total_files += 1
                total_bytes += size

    zip_size_mb = os.path.getsize(output_zip) / (1024 * 1024)
    print(f"Successfully packaged {total_files} files into {output_zip} ({zip_size_mb:.2f} MB)")

if __name__ == '__main__':
    src = os.path.abspath('.')
    parent = os.path.dirname(src)
    dest = os.path.join(parent, 'q-netra-ai.zip')
    make_zip(src, dest)
