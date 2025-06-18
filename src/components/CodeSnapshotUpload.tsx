
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileCode, Upload, Download, Trash2 } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';

interface CodeSnapshot {
  name: string;
  url: string;
  createdAt: string;
  size: number;
}

interface CodeSnapshotUploadProps {
  onSnapshotUploaded?: (snapshot: CodeSnapshot) => void;
  snapshots?: CodeSnapshot[];
}

const CodeSnapshotUpload: React.FC<CodeSnapshotUploadProps> = ({
  onSnapshotUploaded,
  snapshots = []
}) => {
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  
  const { uploadFile, deleteFile, uploading, progress } = useFileUpload({
    bucket: 'code-snapshots',
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['text/*', 'application/json', '.js', '.ts', '.py', '.java', '.cpp', '.c', '.txt']
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const snapshotName = fileName.trim() || file.name;
    const uploadedUrl = await uploadFile(file, `${Date.now()}-${snapshotName}`);
    
    if (uploadedUrl) {
      const snapshot: CodeSnapshot = {
        name: snapshotName,
        url: uploadedUrl,
        createdAt: new Date().toISOString(),
        size: file.size
      };
      
      onSnapshotUploaded?.(snapshot);
      setFileName('');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <FileCode className="h-5 w-5 mr-2 text-blue-400" />
            Upload Code Snapshot
          </CardTitle>
          <CardDescription className="text-slate-400">
            Save your code solutions and implementations privately
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="fileName" className="text-white">
              Snapshot Name (optional)
            </Label>
            <Input
              id="fileName"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter a name for your code snapshot"
              className="bg-slate-700 border-slate-600 text-white"
              disabled={uploading}
            />
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-slate-400">Uploading... {progress}%</p>
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              onClick={triggerFileInput}
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Select File'}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept=".js,.ts,.py,.java,.cpp,.c,.txt,.json"
            className="hidden"
          />

          <p className="text-xs text-slate-400">
            Supported formats: JavaScript, TypeScript, Python, Java, C++, C, Text, JSON. Max size: 10MB.
          </p>
        </CardContent>
      </Card>

      {snapshots.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Your Code Snapshots</CardTitle>
            <CardDescription className="text-slate-400">
              Manage your saved code files
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {snapshots.map((snapshot, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-700 rounded-lg border border-slate-600"
                >
                  <div className="flex items-center space-x-3">
                    <FileCode className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">{snapshot.name}</p>
                      <p className="text-xs text-slate-400">
                        {formatFileSize(snapshot.size)} • {new Date(snapshot.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(snapshot.url, snapshot.name)}
                      className="text-blue-400 border-blue-600 hover:bg-blue-600 hover:text-white"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-400 border-red-600 hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CodeSnapshotUpload;
