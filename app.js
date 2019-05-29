document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById('form');
    // http://104.236.155.155:8900

    document.getElementById('currRequestsNav').addEventListener('click', function () {
        form.style.display = 'none';
        document.getElementById('currentRequests').style.display = 'block';
        this.classList.add('active')
        document.getElementById('newRequestsNav').classList.remove('active')

        fetch('http://104.236.155.155:8900/getCurrentRequests')
            .then(function (response) {
                return response.json();
            })
            .then(function (requests) {

                if (requests.length > 0) {
                    requests.map(request => {
                        const li = document.createElement('li');
                        li.innerHTML = `
                            <input class="requestId" type="hidden" value="${request._id}" />
                            <p>Date: ${request.date}</p>
                            <p>From: ${request.fromTime}</p>
                            <p>To: ${request.toTime}</p>
                            <p style="word-wrap: break-word;">Reason: ${request.reason}</p>
                            <button type="button" class="cancelRequest btn btn-danger btn-sm">Cancel Request</button>`;
                        li.classList.add('list-group-item')

                        document.getElementById('currentRequests').appendChild(li);
                    })

                    let cancelRequest = document.getElementsByClassName('cancelRequest');

                    for (let i = 0; i < cancelRequest.length; i++) {
                        cancelRequest[i].addEventListener('click', function () {
                            const requestId = this.parentNode.getElementsByClassName('requestId')[0].value;
                            var xhr = new XMLHttpRequest();
                            xhr.open('PUT', `http://104.236.155.155:8900/cancelRequest/${requestId}`);
                            xhr.send(null);
                            document.getElementById('currentRequests').removeChild(this.parentNode);
                        })
                    }
                } else {
                    const p = document.createElement('p');
                    p.style.textAlign = 'center';
                    p.style.padding = '10px'
                    p.innerText = 'No pending time off';
                    document.getElementById('currentRequests').appendChild(p)
                }
            });
    })

    // Show submit new request tab
    document.getElementById('newRequestsNav').addEventListener('click', function () {
        form.style.display = 'block';
        document.getElementById('currentRequests').style.display = 'none';
        this.classList.add('active')
        document.getElementById('currRequestsNav').classList.remove('active')
    })

    // Check if form is filled out before enabling the submit button
    document.addEventListener('keyup', function () {
        if (form.checkValidity()) {
            document.querySelector('button').classList.remove('disabled')
        } else {
            document.querySelector('button').classList.add('disabled')
        }
    })

    // Submit Form
    document.querySelector('button').addEventListener('click', function () {
        if (form.checkValidity()) {
            form.submit();
            document.querySelector('button').classList.add('disabled')
            form.reset();
        }
    });

});

