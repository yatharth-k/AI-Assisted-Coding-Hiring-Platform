import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface SampleCase {
  input: string;
  output: string;
}

interface ProblemFormProps {
  initialValues?: {
    title?: string;
    description?: string;
    input_format?: string;
    output_format?: string;
    sample_cases?: SampleCase[];
    tags?: string[];
    difficulty?: string;
  };
  onSave: (data: any) => void;
  onCancel?: () => void;
  loading?: boolean;
}

const difficultyOptions = ["Easy", "Medium", "Hard"];
const tagOptions = ["Array", "String", "Math", "DP", "Graph", "Greedy", "Hashing", "Sorting", "Tree", "Binary Search"];

export default function ProblemForm({ initialValues = {}, onSave, onCancel, loading }: ProblemFormProps) {
  const [title, setTitle] = useState(initialValues.title || "");
  const [description, setDescription] = useState(initialValues.description || "");
  const [inputFormat, setInputFormat] = useState(initialValues.input_format || "");
  const [outputFormat, setOutputFormat] = useState(initialValues.output_format || "");
  const [sampleCases, setSampleCases] = useState<SampleCase[]>(initialValues.sample_cases || [{ input: "", output: "" }]);
  const [tags, setTags] = useState<string[]>(initialValues.tags || []);
  const [difficulty, setDifficulty] = useState(initialValues.difficulty || "Easy");

  const handleSampleCaseChange = (idx: number, field: "input" | "output", value: string) => {
    setSampleCases((prev) => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };
  const addSampleCase = () => setSampleCases((prev) => [...prev, { input: "", output: "" }]);
  const removeSampleCase = (idx: number) => setSampleCases((prev) => prev.filter((_, i) => i !== idx));

  const handleTagToggle = (tag: string) => {
    setTags((prev) => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      input_format: inputFormat,
      output_format: outputFormat,
      sample_cases: sampleCases,
      tags,
      difficulty,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-xl mx-auto">
      <div>
        <label className="block font-semibold mb-1">Title</label>
        <Input value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div>
        <label className="block font-semibold mb-1">Description</label>
        <ReactQuill value={description} onChange={setDescription} theme="snow" className="bg-white" />
      </div>
      <div>
        <label className="block font-semibold mb-1">Input Format</label>
        <Textarea value={inputFormat} onChange={e => setInputFormat(e.target.value)} />
      </div>
      <div>
        <label className="block font-semibold mb-1">Output Format</label>
        <Textarea value={outputFormat} onChange={e => setOutputFormat(e.target.value)} />
      </div>
      <div>
        <label className="block font-semibold mb-1">Sample Test Cases</label>
        {sampleCases.map((sc, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <Textarea
              placeholder="Input"
              value={sc.input}
              onChange={e => handleSampleCaseChange(idx, "input", e.target.value)}
              className="flex-1"
            />
            <Textarea
              placeholder="Output"
              value={sc.output}
              onChange={e => handleSampleCaseChange(idx, "output", e.target.value)}
              className="flex-1"
            />
            {sampleCases.length > 1 && (
              <Button type="button" variant="destructive" size="sm" onClick={() => removeSampleCase(idx)}>-</Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addSampleCase}>+ Add Case</Button>
      </div>
      <div>
        <label className="block font-semibold mb-1">Tags</label>
        <div className="flex flex-wrap gap-2">
          {tagOptions.map(tag => (
            <Button
              key={tag}
              type="button"
              variant={tags.includes(tag) ? "default" : "outline"}
              size="sm"
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>
      <div>
        <label className="block font-semibold mb-1">Difficulty</label>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            {difficultyOptions.map(opt => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2 justify-end">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Problem"}</Button>
      </div>
    </form>
  );
} 