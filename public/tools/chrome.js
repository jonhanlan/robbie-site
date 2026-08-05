/* Shared toolkit chrome — fixed top menu for guide / scene / pitch / tools */
(function () {
  if (document.getElementById('toolkit-chrome')) return

  var path = (location.pathname || '').replace(/\/+$/, '')
  var page = 'tools'
  if (/\/guide(?:\/|$)/.test(path)) page = 'guide'
  else if (/\/scene(?:\/|$)/.test(path)) page = 'scene'
  else if (/\/pitch(?:\/|$)/.test(path)) page = 'pitch'
  else if (/\/tools(?:\/|$)/.test(path)) page = 'tools'

  var href = page === 'tools'
    ? { tools: './', guide: '../guide/', scene: '../scene/', pitch: '../pitch/' }
    : { tools: '../tools/', guide: '../guide/', scene: '../scene/', pitch: '../pitch/' }

  var items = [
    { id: 'tools', label: 'Home', title: 'Toolkit home' },
    { id: 'guide', label: 'Guide', title: 'Field guide' },
    { id: 'scene', label: 'Map', title: 'Scene map' },
    { id: 'pitch', label: 'Ideas', title: 'Release ideas' },
  ]

  var nav = document.createElement('nav')
  nav.id = 'toolkit-chrome'
  nav.setAttribute('aria-label', 'Toolkit')
  nav.innerHTML =
    '<div class="tk-in">' +
      '<a class="tk-brand" href="' + href.tools + '" title="Toolkit home">Robbie <em>tools</em><span class="tk-priv">private</span></a>' +
      '<div class="tk-nav" role="list">' +
        items.map(function (item) {
          var cur = item.id === page ? ' aria-current="page"' : ''
          return '<a role="listitem" href="' + href[item.id] + '" title="' + item.title + '"' + cur + '>' + item.label + '</a>'
        }).join('') +
      '</div>' +
      '<button type="button" class="tk-action" id="tkAction" hidden></button>' +
    '</div>'

  document.body.classList.add('tk-has-chrome')
  if (page === 'scene') document.body.classList.add('tk-map')
  if (page === 'guide') document.body.classList.add('tk-guide')
  document.body.insertBefore(nav, document.body.firstChild)

  var action = document.getElementById('tkAction')

  // Guide: chapter Jump lives in chrome (second sticky bar hidden)
  if (page === 'guide') {
    var openNav = document.getElementById('openNav')
    if (openNav && action) {
      action.hidden = false
      action.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h12M4 18h8"/></svg>' +
        '<span class="tk-action-label">Chapters</span>'
      action.setAttribute('aria-label', 'Jump to chapter')
      action.addEventListener('click', function () { openNav.click() })
    }
    // Drawer links to other tools are redundant with chrome — optional quiet
    var dtools = document.querySelector('.dtools')
    if (dtools) dtools.style.display = 'none'
  }

  // Map: Places control in chrome on small screens
  if (page === 'scene') {
    var placesBtn = document.getElementById('placesBtn')
    if (placesBtn && action) {
      function syncPlaces() {
        var mobile = window.matchMedia('(max-width:720px)').matches
        action.hidden = !mobile
        if (mobile) {
          action.innerHTML =
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>' +
            '<span class="tk-action-label">Places</span>'
          action.setAttribute('aria-label', 'Open places list')
          action.onclick = function () { placesBtn.click() }
        } else {
          action.onclick = null
        }
      }
      syncPlaces()
      window.addEventListener('resize', syncPlaces)
    }
  }

  // Shared bottom hop links (scroll docs only)
  if (page === 'guide' || page === 'pitch' || page === 'tools') {
    var existing = document.querySelector('.tk-doc-foot .tk-hop')
    if (!existing) {
      var host = document.querySelector('footer.end, footer.rv, footer') || null
      var hop = document.createElement('div')
      hop.className = 'tk-hop'
      hop.setAttribute('aria-label', 'Other tools')
      hop.innerHTML = items
        .filter(function (i) { return i.id !== page })
        .map(function (i) {
          return '<a href="' + href[i.id] + '">' + i.label + '</a>'
        })
        .join('')
      if (host) {
        host.classList.add('tk-doc-foot')
        host.appendChild(hop)
      }
    }
  }
})()
