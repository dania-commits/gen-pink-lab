const SAMPLE_CSV = `rider_id,rider_name,work_date,hours_worked,hourly_rate,bonus,bank_details_ok,notes
R1000,Elin A,2026-01-12,4.9,150,0,TRUE,
R1001,Elin E,2026-01-10,6.0,150,0,TRUE,
R1002,Oskar E,2026-01-01,6.9,170,75,FALSE,
R1002,Oskar E,2026-01-04,6.1,160,0,TRUE,
R1002,Oskar E,2026-01-12,6.0,160,0,TRUE,
R1003,Nora C,2026-01-02,5.7,160,0,,
R1004,Linnea A,2026-01-08,6.8,160,0,,
R1004,Linnea A,2026-01-05,8.8,170,0,,
R1004,Linnea A,2026-01-04,7.9,150,0,TRUE,
R1005,Sam B,2026-01-07,4.9,170,0,TRUE,
R1006,Noah C,2026-01-11,4.9,170,0,,
R1007,Elin B,2026-01-12,4.7,160,50,TRUE,
R1007,Elin B,2026-01-11,7.8,150,0,TRUE,
R1007,Elin B,2026-01-04,8.8,160,50,TRUE,
R1008,Sam B,2026-01-12,5.2,170,50,FALSE,
R1008,Sam B,2026-01-11,6.2,160,0,TRUE,
R1008,Sam B,2026-01-12,6.9,160,75,FALSE,
R1009,Amina E,2026-01-06,4.5,150,75,FALSE,
R1009,Amina E,2026-01-02,8.3,150,0,TRUE,
R1010,Nora D,2026-01-02,5.7,170,50,,
R1010,Nora D,2026-01-05,9.8,150,0,,
R1010,Nora D,2026-01-13,4.9,170,0,TRUE,
R1011,Linnea D,2026-01-08,3.0,170,0,,
R1012,Nora B,2026-01-02,9.1,160,75,,
R1012,Nora B,2026-01-04,4.1,150,75,,
R1012,Nora B,2026-01-01,7.2,160,0,TRUE,
R1013,Amina C,2026-01-04,3.4,170,0,TRUE,
R1013,Amina C,2026-01-12,6.4,150,75,TRUE,
R1014,Maja D,2026-01-03,4.9,170,50,TRUE,
R1014,Maja D,2026-01-09,8.3,170,0,TRUE,
R1014,Maja D,2026-01-07,10.0,170,0,FALSE,
R1015,Amina E,2026-01-02,4.7,150,0,TRUE,
R1015,Amina E,2026-01-10,6.9,170,0,TRUE,
R1016,Sam A,2026-01-02,9.3,160,0,,
R1017,Oskar C,2026-01-08,4.5,150,75,,
R1017,Oskar C,2026-01-08,4.7,160,50,TRUE,
R1017,Oskar C,2026-01-02,3.7,160,0,FALSE,
R1018,Sara D,2026-01-01,7.7,170,0,TRUE,
R1018,Sara D,2026-01-07,8.1,150,0,TRUE,
R1018,Sara D,2026-01-04,6.8,150,50,TRUE,
R1019,Linnea D,2026-01-14,9.5,160,75,TRUE,
R1020,Alex E,2026-01-02,9.5,150,0,FALSE,
R1021,Elias D,2026-01-14,5.8,150,0,FALSE,
R1022,Alex D,2026-01-13,8.5,160,50,,
R1022,Alex D,2026-01-11,8.0,150,0,TRUE,
R1023,Oskar A,2026-01-12,6.8,170,0,TRUE,
R1023,Oskar A,2026-01-01,7.1,170,75,TRUE,
R1023,Oskar A,2026-01-01,9.7,150,0,TRUE,
R1024,Hugo A,2026-01-14,4.6,150,75,TRUE,
R1024,Hugo A,2026-01-10,7.2,170,0,FALSE,
R1024,Hugo A,2026-01-11,7.1,170,0,TRUE,
R1025,Oskar C,2026-01-05,5.8,170,0,FALSE,
R1026,Noah A,2026-01-08,7.3,170,0,TRUE,
R1027,Fatima B,2026-01-05,3.9,160,0,TRUE,
R1027,Fatima B,2026-01-06,5.0,160,75,TRUE,
R1027,Fatima B,2026-01-10,9.9,170,75,TRUE,
,Unknown Rider,2026-01-05,6,160,0,TRUE,Missing rider id
R1001,Sam B,bad-date,5,160,0,TRUE,Invalid date
R1002,Maja C,2026-01-04,,160,0,TRUE,Missing hours
R1003,Oskar D,2026-01-04,8,,0,TRUE,Missing rate
R1004,Linnea E,2026-01-03,18,160,0,TRUE,Outlier hours
R1005,Noah A,2026-01-06,7,160,0,TRUE,Duplicate entry
R1005,Noah A,2026-01-06,7,160,0,TRUE,Duplicate entry
`

const $ = (q) => document.querySelector(q)

const state = { rows: [], checked: false, filters: { show: 'all' } }

const fmtMoney = (n) => {
  if (Number.isNaN(n)) return '0'
  return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(n)
}

const parseBool = (v) => {
  const s = String(v ?? '').trim().toLowerCase()
  return s === 'true' || s === '1' || s === 'yes' || s === 'y'
}

const toNum = (v) => {
  const n = Number(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) ? n : NaN
}

const parseCsv = (text) => {
  const rows = []
  let i = 0, field = '', row = [], inQuotes = false
  const pushField = () => { row.push(field); field = '' }
  const pushRow = () => { rows.push(row); row = [] }

  while (i < text.length) {
    const c = text[i]
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') { field += '"'; i += 2; continue }
      inQuotes = !inQuotes
      i++
      continue
    }
    if (!inQuotes && c === ',') { pushField(); i++; continue }
    if (!inQuotes && (c === '\n' || c === '\r')) {
      if (c === '\r' && text[i + 1] === '\n') i++
      pushField()
      if (row.length > 1 || row.some(x => x !== '')) pushRow()
      i++
      continue
    }
    field += c
    i++
  }
  pushField()
  if (row.length > 1 || row.some(x => x !== '')) pushRow()

  if (rows.length === 0) return []
  const headers = rows[0].map(h => h.trim())
  return rows.slice(1).map(r => {
    const obj = {}
    headers.forEach((h, idx) => obj[h] = (r[idx] ?? '').trim())
    return obj
  })
}

const setKpis = () => {
  const riders = new Set(state.rows.map(r => r.rider_id)).size
  const flags = state.rows.filter(r => r.status !== 'OK').length
  const payout = state.rows.reduce((acc, r) => acc + (r.total_pay || 0), 0)
  $('#kpiRiders').textContent = String(riders)
  $('#kpiRows').textContent = String(state.rows.length)
  $('#kpiFlags').textContent = String(flags)
  $('#kpiPayout').textContent = fmtMoney(payout)
}

const buildChips = () => {
  const chips = $('#chips')
  chips.innerHTML = ''
  const items = [
    { key: 'all', label: 'All' },
    { key: 'flagged', label: 'Flagged' },
    { key: 'ok', label: 'Only OK' }
  ]
  items.forEach(it => {
    const el = document.createElement('div')
    el.className = 'chip' + (state.filters.show === it.key ? ' active' : '')
    el.textContent = it.label
    el.onclick = () => { state.filters.show = it.key; buildChips(); renderTable(); }
    chips.appendChild(el)
  })
}

const suggestAction = (r) => {
  const reasons = r.reasons || []
  const has = (s) => reasons.some(x => x.toLowerCase().includes(s))
  if (has('bank')) return 'Contact rider to confirm bank details, then re run payout'
  if (has('duplicate')) return 'Confirm correct entry, remove duplicate, then proceed'
  if (has('hours')) return 'Validate hours with schedule and rider follow up'
  if (has('rate')) return 'Verify contract rate and correct the value'
  if (has('date')) return 'Correct date format to ISO, then proceed'
  if (has('id')) return 'Add rider id, ensure it matches the roster'
  return 'Review row with the rider and correct missing info'
}

const computeChecks = () => {
  const seen = new Map()
  const allHours = state.rows.map(r => r.hours_worked).filter(Number.isFinite)
  const mean = allHours.length ? allHours.reduce((a,b)=>a+b,0)/allHours.length : 0
  const std = allHours.length ? Math.sqrt(allHours.reduce((a,b)=>a+Math.pow(b-mean,2),0)/allHours.length) : 0
  const outlierHigh = mean + 2.5 * std

  state.rows.forEach(r => {
    const reasons = []
    let sev = 'OK'

    if (!r.rider_id) { sev = 'BAD'; reasons.push('Missing rider id') }
    if (!r.work_date || isNaN(Date.parse(r.work_date))) { sev = 'BAD'; reasons.push('Invalid work date') }
    if (!Number.isFinite(r.hours_worked) || r.hours_worked < 0) { sev = 'BAD'; reasons.push('Invalid hours worked') }
    if (!Number.isFinite(r.hourly_rate) || r.hourly_rate <= 0) { sev = 'BAD'; reasons.push('Invalid hourly rate') }

    const key = `${r.rider_id}::${r.work_date}`
    if (r.rider_id && r.work_date) {
      if (seen.has(key)) {
        if (sev !== 'BAD') sev = 'WARN'
        reasons.push('Potential duplicate entry for the same rider and day')
      } else {
        seen.set(key, true)
      }
    }

    if (Number.isFinite(r.hours_worked) && r.hours_worked > Math.max(12, outlierHigh)) {
      if (sev === 'OK') sev = 'WARN'
      reasons.push('Unusually high hours, please verify')
    }

    if (r.bank_details_ok === false) {
      if (sev === 'OK') sev = 'WARN'
      reasons.push('Bank details not confirmed, rider follow up needed')
    }

    r.base_pay = Number.isFinite(r.hours_worked) && Number.isFinite(r.hourly_rate) ? (r.hours_worked * r.hourly_rate) : 0
    r.total_pay = r.base_pay + (Number.isFinite(r.bonus) ? r.bonus : 0)

    r.status = sev === 'OK' ? 'OK' : (sev === 'WARN' ? 'Needs review' : 'Block and fix')
    r.reasons = reasons
  })

  state.checked = true
}

const escapeHtml = (s) => String(s ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

const numCell = (v) => {
  if (!Number.isFinite(v)) return '<span class="status bad">missing</span>'
  return String(v).replace('.', ',')
}

const showDetail = (r) => {
  const el = $('#detail')
  el.className = 'detail'
  const reasons = (r.reasons || []).length ? `<ul>${r.reasons.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul>` : '<p>Looks clean.</p>'
  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap">
      <div>
        <strong>${escapeHtml(r.rider_name || 'Unknown rider')}</strong>
        <div class="muted">Rider ${escapeHtml(r.rider_id || 'missing id')} · ${escapeHtml(r.work_date || 'invalid date')}</div>
      </div>
      <div class="muted"><strong>Suggested action</strong> ${escapeHtml(suggestAction(r))}</div>
    </div>
    <div style="margin-top:10px">
      <div class="muted"><strong>Computed payout</strong> ${fmtMoney(r.total_pay || 0)} · Base ${fmtMoney(r.base_pay || 0)} · Bonus ${fmtMoney(r.bonus || 0)}</div>
    </div>
    <div style="margin-top:10px">
      <strong>Why it was flagged</strong>
      ${reasons}
    </div>
  `
}

const renderFollowups = () => {
  const wrap = $('#followups')
  const items = state.rows.filter(r => r.status !== 'OK')
  if (!items.length) {
    wrap.className = 'followups empty'
    wrap.textContent = 'No follow ups. Everything looks clean.'
    return
  }
  wrap.className = 'followups'
  wrap.innerHTML = ''
  items.slice(0, 10).forEach(r => {
    const el = document.createElement('div')
    el.className = 'fu'
    const sev = r.status === 'Block and fix' ? 'bad' : 'warn'
    const tagText = r.status === 'Block and fix' ? 'Fix before payout' : 'Review'
    el.innerHTML = `
      <div class="fuTop">
        <div>
          <strong>${escapeHtml(r.rider_name || 'Unknown rider')}</strong>
          <div class="muted">Rider ${escapeHtml(r.rider_id || 'missing id')} · ${escapeHtml(r.work_date || 'invalid date')}</div>
        </div>
        <div class="tag ${sev}">${tagText}</div>
      </div>
      <div class="fuBody">
        <div><strong>Action</strong> ${escapeHtml(suggestAction(r))}</div>
        <div class="muted" style="margin-top:6px">${(r.reasons || []).map(escapeHtml).join(' · ')}</div>
      </div>
    `
    wrap.appendChild(el)
  })
  if (items.length > 10) {
    const more = document.createElement('div')
    more.className = 'muted'
    more.textContent = `Showing 10 of ${items.length} follow ups`
    wrap.appendChild(more)
  }
}

const renderTable = () => {
  const tbody = $('#table tbody')
  tbody.innerHTML = ''

  const rows = state.rows.filter(r => {
    if (state.filters.show === 'flagged') return r.status !== 'OK'
    if (state.filters.show === 'ok') return r.status === 'OK'
    return true
  })

  rows.forEach(r => {
    const tr = document.createElement('tr')
    if (r.status !== 'OK') tr.classList.add('flag')
    const statusClass = r.status === 'OK' ? 'good' : (r.status === 'Needs review' ? 'warn' : 'bad')
    tr.innerHTML = `
      <td>${escapeHtml(r.rider_name || '')}<div class="muted">#${escapeHtml(r.rider_id || '')}</div></td>
      <td>${escapeHtml(r.work_date || '')}</td>
      <td>${numCell(r.hours_worked)}</td>
      <td>${numCell(r.hourly_rate)}</td>
      <td>${fmtMoney(r.base_pay || 0)}</td>
      <td>${fmtMoney(r.bonus || 0)}</td>
      <td><strong>${fmtMoney(r.total_pay || 0)}</strong></td>
      <td class="status ${statusClass}">${escapeHtml(r.status)}</td>
    `
    tr.onclick = () => showDetail(r)
    tbody.appendChild(tr)
  })

  setKpis()
}

const enableActions = (ok) => {
  $('#runChecks').disabled = !ok
  $('#exportCsv').disabled = !ok || !state.checked
}

const loadRows = (raw) => {
  state.checked = false
  state.rows = raw.map(r => {
    const out = {
      rider_id: (r.rider_id ?? '').trim(),
      rider_name: (r.rider_name ?? '').trim(),
      work_date: (r.work_date ?? '').trim(),
      hours_worked: toNum(r.hours_worked),
      hourly_rate: toNum(r.hourly_rate),
      bonus: toNum(r.bonus),
      bank_details_ok: parseBool(r.bank_details_ok),
      notes: (r.notes ?? '').trim()
    }
    if (String(r.bank_details_ok ?? '').trim() === '') out.bank_details_ok = false
    return out
  })

  enableActions(true)
  buildChips()
  $('#followups').className = 'followups empty'
  $('#followups').textContent = 'Ready. Click Run checks.'
  $('#detail').className = 'detail empty'
  $('#detail').textContent = 'Select a row to see details'
  renderTable()
  setKpis()
}

const exportCleanCsv = () => {
  const headers = ['rider_id','rider_name','work_date','hours_worked','hourly_rate','bonus','bank_details_ok','base_pay','total_pay','status','notes']
  const lines = [headers.join(',')]
  state.rows.forEach(r => {
    const row = headers.map(h => {
      const v = r[h]
      if (typeof v === 'string') {
        const needs = v.includes(',') || v.includes('"') || v.includes('\n')
        const s = v.replaceAll('"', '""')
        return needs ? `"${s}"` : s
      }
      if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE'
      if (Number.isFinite(v)) return String(v)
      return ''
    })
    lines.push(row.join(','))
  })
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'rider_payments_checked.csv'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

const loadSample = async () => {
  const raw = parseCsv(SAMPLE_CSV)
  loadRows(raw)
}

$('#loadSample').onclick = () => loadSample()

$('#fileInput').addEventListener('change', async (e) => {
  const f = e.target.files?.[0]
  if (!f) return
  const txt = await f.text()
  const raw = parseCsv(txt)
  loadRows(raw)
})

$('#runChecks').onclick = () => {
  computeChecks()
  renderFollowups()
  renderTable()
  enableActions(true)
  $('#exportCsv').disabled = false
}

$('#exportCsv').onclick = () => exportCleanCsv()

buildChips()
