<script lang="ts">
	import { MicIcon, StopCircleIcon } from 'lucide-svelte'
	import { createEventDispatcher, onMount } from 'svelte'

	const d = createEventDispatcher()

	let loading = false
	let hasMic = false
	let stream: MediaStream | undefined
	let recorder: MediaRecorder | undefined
	let blobs: Blob[] = []
	let audio: Blob | undefined

	onMount(async () => {
		hasMic = (await navigator.mediaDevices.enumerateDevices()).some(i => i.kind === 'audioinput')
		if (!hasMic) console.warn('Speech Recognition: No mic detected')
	})

	function recordSpeech() {
		if (!stream || !recorder) {
			if (stream) {
				stream.getTracks().forEach(t => t.stop())
				stream = undefined
			}
			if (recorder) {
				if (recorder.state !== 'inactive') recorder.stop()
				recorder = undefined
			}
		}

		navigator.mediaDevices
			.getUserMedia({ audio: true })
			.then(stream => {
				console.log(stream)
				stream = stream

				blobs = []
				recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
				recorder.addEventListener('dataavailable', e => {
					blobs.push(e.data)
				})
				recorder.addEventListener('stop', () => {
					audio = new Blob(blobs, { type: recorder!.mimeType })
					console.info('Speech Recognition: Stopped recording')
					recorder = undefined
					recognise()
				})
				recorder.start()
				console.info('Speech Recognition: Started recording')
			})
			.catch(e => {
				switch (e.name.toLowerCase()) {
					case 'aborterror':
					case 'notreadableerror':
					case 'securityerror':
						alert(
							'An error occured while fetching your microphone. Make sure it is plugged in, and your browser has permission to use it.'
						)
						break
					case 'notfounderror':
						alert(
							'Your microphone is not available. Make sure it is plugged in, and your browser has permission to use it.'
						)
						break
					case 'notallowederror':
						alert(
							'You must allow ChatCrafters to access your microphone to be able to use Speech Recognition'
						)
						break
					default:
						alert(
							'An error occured while fetching your microphone. Make sure it is plugged in, and your browser has permission to use it.'
						)
						break
				}
			})
	}

	function stopRecording() {
		if (!recorder) {
			recordSpeech()
			return
		}

		if (recorder.state !== 'inactive') {
			recorder.stop()
		}
		if (stream) {
			stream.getTracks().forEach(t => t.stop())
			stream = undefined
		}
	}

	async function recognise() {
		if (!audio) return
		loading = true
		try {
			const res = await fetch(`/api/recogniseSpeech`, {
				method: 'POST',
				headers: {
					'Content-Type': audio.type
				},
				body: audio
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data.error || data.message || 'An unknown error occured')

			d('recognise', data.text)
		} catch (e) {
			alert('Could not recognise speech: ' + (e as Error)?.message)
		} finally {
			loading = false
		}
	}
</script>

{#if hasMic}
	<button
		type="button"
		class="btn-circle btn-neutral grid place-items-center"
		aria-label={recorder?.state === 'recording' ? 'Stop recording' : 'Recognise Speech'}
		title={recorder?.state === 'recording' ? 'Stop recording' : 'Recognise Speech'}
		on:click={() => {
			if (recorder?.state === 'recording') stopRecording()
			else recordSpeech()
		}}
	>
		{#if loading}
			<span class="loading loading-spinner"></span>
		{:else if recorder?.state === 'recording'}
			<StopCircleIcon class="h-6 w-6" />
		{:else}
			<MicIcon class="h-6 w-6" />
		{/if}
	</button>
{/if}
