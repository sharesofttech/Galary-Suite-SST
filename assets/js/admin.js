document.addEventListener('DOMContentLoaded', function () {

    // Initialize WordPress native color pickers for all color settings.
    if (window.jQuery && typeof window.jQuery.fn.wpColorPicker === 'function') {
        window.jQuery('.pgs-color-input').wpColorPicker();
    }

    var tabs   = document.querySelectorAll('.pgs-device-tab');
    var panels = document.querySelectorAll('.pgs-panel');
    var form   = document.getElementById('pgs-settings-form');
    var saveButton = form ? form.querySelector('.pgs-save-button') : null;
    var status = form ? form.querySelector('.pgs-save-status') : null;

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function (e) {
            e.preventDefault();
            var device = tab.getAttribute('data-device');

            tabs.forEach(function (t) {
                t.classList.remove('is-active');
            });
            tab.classList.add('is-active');

            panels.forEach(function (panel) {
                panel.classList.toggle(
                    'pgs-panel-active',
                    panel.getAttribute('data-device-panel') === device
                );
            });
        });
    });

    if (!form || typeof PGS_ADMIN === 'undefined' || !PGS_ADMIN.ajax_url) {
        return;
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (saveButton) {
            saveButton.disabled = true;
            saveButton.textContent = 'Saving...';
        }
        if (status) {
            status.textContent = '';
            status.className = 'pgs-save-status';
        }

        var formData = new FormData(form);
        formData.set('action', 'pgs_save_settings');
        formData.set('nonce', PGS_ADMIN.nonce);

        fetch(PGS_ADMIN.ajax_url, {
            method: 'POST',
            credentials: 'same-origin',
            body: formData
        })
        .then(function (response) {
            return response.json();
        })
        .then(function (result) {
            if (!result || !result.success) {
                throw new Error(result && result.data && result.data.message
                    ? result.data.message
                    : 'Unable to save settings.');
            }

            if (status) {
                status.textContent = result.data.message || 'Settings saved successfully.';
                status.classList.add('is-success');
            }
        })
        .catch(function (error) {
            if (status) {
                status.textContent = error.message || 'Unable to save settings.';
                status.classList.add('is-error');
            }
        })
        .finally(function () {
            if (saveButton) {
                saveButton.disabled = false;
                saveButton.textContent = 'Save Changes';
            }
        });
    });
});
