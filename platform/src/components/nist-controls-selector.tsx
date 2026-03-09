'use client'

import React, { useState } from 'react'

const NISTControlsSelector = () => {
  const CONTROL_FAMILIES = [
    { name: 'Access Control', alias: 'ac' },
    { name: 'Awareness and Training', alias: 'at' },
    { name: 'Audit and Accountability', alias: 'au' },
    { name: 'Assessment, Authorization, and Monitoring', alias: 'ca' },
    { name: 'Configuration Management', alias: 'cm' },
    { name: 'Contingency Planning', alias: 'cp' },
    { name: 'Identification and Authentication', alias: 'ia' },
    { name: 'Incident Response', alias: 'ir' },
    { name: 'Maintenance', alias: 'ma' },
    { name: 'Media Protection', alias: 'mp' },
    { name: 'Physical and Environmental Protection', alias: 'pe' },
    { name: 'Planning', alias: 'pl' },
    { name: 'Program Management', alias: 'pm' },
    { name: 'Personnel Security', alias: 'ps' },
    { name: 'PII Processing and Transparency', alias: 'pt' },
    { name: 'Risk Assessment', alias: 'ra' },
    { name: 'System and Services Acquisition', alias: 'sa' },
    { name: 'System and Communications Protection', alias: 'sc' },
    { name: 'System and Information Integrity', alias: 'si' },
    { name: 'Supply Chain Risk Management', alias: 'sr' },
  ]

  const [selectedControls, setSelectedControls] = useState([{ family: '', range: { start: 1, end: 1 } }])

  const handleAddControl = () => {
    setSelectedControls([...selectedControls, { family: '', range: { start: 1, end: 1 } }])
  }

  const handleRemoveControl = (index: number): void => {
    const newControls = selectedControls.filter((_, i) => i !== index)
    setSelectedControls(newControls)
  }

  const handleControlChange = (index: number, field: 'family' | 'start' | 'end', value: string): void => {
    const newControls = [...selectedControls]
    if (field === 'family') {
      newControls[index].family = value
    } else if (field === 'start' || field === 'end') {
      const numValue = parseInt(value) || 1
      newControls[index].range[field] = Math.min(Math.max(numValue, 1), 50)
    }
    setSelectedControls(newControls)
  }

  const handleStartIngest = async () => {
    const validControls = selectedControls.filter(control => control.family)

    const response = await fetch('/api/ingest/nist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validControls),
    })

    if (!response.ok) {
      console.error('Error ingesting NIST controls:', response.statusText)
      return
    }

    const data = await response.json()
  }

  return (
    <div className="w-full p-8">
      {selectedControls.map((control, index) => (
        <div key={index} className="mb-4">
          <div className="mb-4">
            <label htmlFor={`family-${index}`} className="block mb-2 text-sm font-medium">
              Control Family
            </label>
            <select id={`family-${index}`} value={control.family} onChange={e => handleControlChange(index, 'family', e.target.value)} className="w-full px-4 py-2 border rounded">
              <option value="">Select family</option>
              {CONTROL_FAMILIES.map(family => (
                <option key={family.alias} value={family.alias}>
                  {`${family.alias} - ${family.name}`}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor={`start-${index}`} className="block mb-2 text-sm font-medium">
                Start
              </label>
              <input
                id={`start-${index}`}
                type="number"
                min="1"
                max="50"
                value={control.range.start}
                onChange={e => handleControlChange(index, 'start', e.target.value)}
                className="w-full px-4 py-2 border rounded"
              />
            </div>

            <div>
              <label htmlFor={`end-${index}`} className="block mb-2 text-sm font-medium">
                End
              </label>
              <input
                id={`end-${index}`}
                type="number"
                min="1"
                max="50"
                value={control.range.end}
                onChange={e => handleControlChange(index, 'end', e.target.value)}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
          </div>

          {selectedControls.length > 1 && (
            <button onClick={() => handleRemoveControl(index)} className="w-full px-4 py-2 mb-4 text-sm text-white bg-red-500 rounded hover:bg-red-600">
              Remove Control Family
            </button>
          )}
        </div>
      ))}

      <div className="flex gap-4">
        <button onClick={handleAddControl} className="px-4 py-2 text-sm text-white bg-gray-800 rounded hover:bg-gray-700">
          Add Control Family
        </button>
        <button onClick={handleStartIngest} className="px-4 py-2 text-sm text-white bg-gray-800 rounded hover:bg-gray-700">
          Start Ingest
        </button>
      </div>
    </div>
  )
}

export default NISTControlsSelector
